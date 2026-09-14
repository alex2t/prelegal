"""AI chat that fills in a legal document via conversation.

Two phases per conversation: while `document_type` is unset, a small router
call decides which of the catalog's documents the user wants. Once decided,
subsequent turns use that document's own field-filling schema, which always
returns the complete current field snapshot (not a diff) so the frontend can
just replace its state - no merge logic needed either way.

Uses LiteLLM routed through OpenRouter with Cerebras as the inference
provider, and Structured Outputs so each model reply parses directly into a
typed response.
"""

from collections.abc import Callable
from typing import Literal

from litellm import completion
from pydantic import BaseModel

from backend.documents.ai_addendum import AiAddendumChatTurn, AiAddendumFields
from backend.documents.ai_addendum import system_prompt as ai_addendum_prompt
from backend.documents.business_associate import BusinessAssociateChatTurn, BusinessAssociateFields
from backend.documents.business_associate import system_prompt as business_associate_prompt
from backend.documents.catalog import CATALOG, catalog_prompt
from backend.documents.cloud_service import CloudServiceChatTurn, CloudServiceFields
from backend.documents.cloud_service import system_prompt as cloud_service_prompt
from backend.documents.data_processing import DataProcessingChatTurn, DataProcessingFields
from backend.documents.data_processing import system_prompt as data_processing_prompt
from backend.documents.design_partner import DesignPartnerChatTurn, DesignPartnerFields
from backend.documents.design_partner import system_prompt as design_partner_prompt
from backend.documents.nda import NdaChatTurn, NdaFields
from backend.documents.nda import system_prompt as nda_prompt
from backend.documents.partnership import PartnershipChatTurn, PartnershipFields
from backend.documents.partnership import system_prompt as partnership_prompt
from backend.documents.pilot import PilotChatTurn, PilotFields
from backend.documents.pilot import system_prompt as pilot_prompt
from backend.documents.professional_services import ProfessionalServicesChatTurn, ProfessionalServicesFields
from backend.documents.professional_services import system_prompt as professional_services_prompt
from backend.documents.service_level import ServiceLevelChatTurn, ServiceLevelFields
from backend.documents.service_level import system_prompt as service_level_prompt
from backend.documents.software_license import SoftwareLicenseChatTurn, SoftwareLicenseFields
from backend.documents.software_license import system_prompt as software_license_prompt

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

DocumentType = Literal[
    "mutual_nda",
    "design_partner_agreement",
    "cloud_service_agreement",
    "service_level_agreement",
    "professional_services_agreement",
    "data_processing_agreement",
    "software_license_agreement",
    "partnership_agreement",
    "business_associate_agreement",
    "pilot_agreement",
    "ai_addendum",
]

# Each supported document's field schema, its schema+reply "turn" wrapper
# (the Structured Outputs response_format), and its system-prompt builder.
_DOCUMENTS: dict[DocumentType, tuple[type[BaseModel], type[BaseModel], Callable[[BaseModel], str]]] = {
    "mutual_nda": (NdaFields, NdaChatTurn, nda_prompt),
    "design_partner_agreement": (DesignPartnerFields, DesignPartnerChatTurn, design_partner_prompt),
    "cloud_service_agreement": (CloudServiceFields, CloudServiceChatTurn, cloud_service_prompt),
    "service_level_agreement": (ServiceLevelFields, ServiceLevelChatTurn, service_level_prompt),
    "professional_services_agreement": (
        ProfessionalServicesFields,
        ProfessionalServicesChatTurn,
        professional_services_prompt,
    ),
    "data_processing_agreement": (DataProcessingFields, DataProcessingChatTurn, data_processing_prompt),
    "software_license_agreement": (SoftwareLicenseFields, SoftwareLicenseChatTurn, software_license_prompt),
    "partnership_agreement": (PartnershipFields, PartnershipChatTurn, partnership_prompt),
    "business_associate_agreement": (
        BusinessAssociateFields,
        BusinessAssociateChatTurn,
        business_associate_prompt,
    ),
    "pilot_agreement": (PilotFields, PilotChatTurn, pilot_prompt),
    "ai_addendum": (AiAddendumFields, AiAddendumChatTurn, ai_addendum_prompt),
}

assert set(_DOCUMENTS) == {doc.id for doc in CATALOG}, "every catalog entry must have a document handler"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    document_type: DocumentType | None = None
    fields: dict = {}


class ChatResponse(BaseModel):
    reply: str
    document_type: DocumentType | None = None
    fields: dict = {}


_RouterDocumentType = Literal[
    "mutual_nda",
    "design_partner_agreement",
    "cloud_service_agreement",
    "service_level_agreement",
    "professional_services_agreement",
    "data_processing_agreement",
    "software_license_agreement",
    "partnership_agreement",
    "business_associate_agreement",
    "pilot_agreement",
    "ai_addendum",
    "undecided",
]


class _RouterTurn(BaseModel):
    reply: str
    document_type: _RouterDocumentType = "undecided"


def _router_prompt() -> str:
    return (
        "You help route a user to one of this product's legal document "
        "templates based on freeform conversation.\n\n"
        f"{catalog_prompt()}\n\n"
        "Set document_type to whichever document the user's request matches. "
        'If it\'s not yet clear which one they want, keep document_type as '
        '"undecided" and ask a clarifying question.'
    )


def _messages_payload(messages: list[ChatMessage]) -> list[dict]:
    return [{"role": message.role, "content": message.content} for message in messages]


def _route(messages: list[ChatMessage]) -> _RouterTurn:
    response = completion(
        model=MODEL,
        messages=[{"role": "system", "content": _router_prompt()}] + _messages_payload(messages),
        response_format=_RouterTurn,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    return _RouterTurn.model_validate_json(response.choices[0].message.content)


def _fill(document_type: DocumentType, messages: list[ChatMessage], fields: dict) -> tuple[str, dict]:
    fields_model, turn_model, build_prompt = _DOCUMENTS[document_type]
    current_fields = fields_model.model_validate(fields)
    response = completion(
        model=MODEL,
        messages=[{"role": "system", "content": build_prompt(current_fields)}] + _messages_payload(messages),
        response_format=turn_model,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    turn = turn_model.model_validate_json(response.choices[0].message.content)
    return turn.reply, turn.fields.model_dump()


def run_chat(request: ChatRequest) -> ChatResponse:
    document_type = request.document_type
    if document_type is None:
        routed = _route(request.messages)
        if routed.document_type == "undecided":
            return ChatResponse(reply=routed.reply, document_type=None, fields={})
        document_type = routed.document_type

    reply, fields = _fill(document_type, request.messages, request.fields)
    return ChatResponse(reply=reply, document_type=document_type, fields=fields)
