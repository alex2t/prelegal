"""AI chat that fills in a legal document via conversation.

Two phases per conversation: while `document_type` is unset, a small router
call decides which supported document (if any) the user wants, explaining
and suggesting an alternative if they ask for something unsupported. Once
decided, subsequent turns use that document's own field-filling schema,
which always returns the complete current field snapshot (not a diff) so
the frontend can just replace its state - no merge logic needed either way.

Uses LiteLLM routed through OpenRouter with Cerebras as the inference
provider, and Structured Outputs so each model reply parses directly into a
typed response.
"""

from collections.abc import Callable
from typing import Literal

from litellm import completion
from pydantic import BaseModel

from backend.documents.catalog import catalog_prompt
from backend.documents.design_partner import DesignPartnerChatTurn, DesignPartnerFields
from backend.documents.design_partner import system_prompt as design_partner_prompt
from backend.documents.nda import NdaChatTurn, NdaFields
from backend.documents.nda import system_prompt as nda_prompt
from backend.documents.pilot import PilotChatTurn, PilotFields
from backend.documents.pilot import system_prompt as pilot_prompt

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

DocumentType = Literal["mutual_nda", "design_partner_agreement", "pilot_agreement"]

# Each supported document's field schema, its schema+reply "turn" wrapper
# (the Structured Outputs response_format), and its system-prompt builder.
_DOCUMENTS: dict[DocumentType, tuple[type[BaseModel], type[BaseModel], Callable[[BaseModel], str]]] = {
    "mutual_nda": (NdaFields, NdaChatTurn, nda_prompt),
    "design_partner_agreement": (DesignPartnerFields, DesignPartnerChatTurn, design_partner_prompt),
    "pilot_agreement": (PilotFields, PilotChatTurn, pilot_prompt),
}


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


class _RouterTurn(BaseModel):
    reply: str
    document_type: Literal[
        "mutual_nda", "design_partner_agreement", "pilot_agreement", "undecided"
    ] = "undecided"


def _router_prompt() -> str:
    return (
        "You help route a user to one of this product's supported legal "
        "document templates based on freeform conversation.\n\n"
        f"{catalog_prompt()}\n\n"
        "If the user's request matches one of the [SUPPORTED] documents, "
        "set document_type to it. If they ask for one of the other listed "
        "documents, explain briefly that it isn't supported yet and suggest "
        "whichever supported document is the closest fit, but don't set "
        "document_type until they agree to proceed with one of the supported "
        "ones. If it's still unclear which supported document they want, "
        'keep document_type as "undecided" and ask a clarifying question.'
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
