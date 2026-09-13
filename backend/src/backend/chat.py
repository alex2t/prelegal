"""AI chat that fills in the Mutual NDA cover page fields via conversation.

Uses LiteLLM routed through OpenRouter with Cerebras as the inference
provider, and Structured Outputs so the model's reply parses directly into
`ChatResponse`.
"""

import json
from typing import Literal

from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

REQUIRED_FIELDS = (
    "party1.company, party2.company, purpose, effectiveDate (YYYY-MM-DD), "
    "governingLaw (the US state name only, e.g. \"Delaware\"), jurisdiction "
    "(city or county and state, e.g. \"New Castle County, Delaware\")"
)
OPTIONAL_FIELDS = (
    "signatory names/titles/notice addresses for each party, mndaTermKind "
    '("fixed" or "untilTerminated", default "fixed"), mndaTermYears (default 1), '
    'confidentialityTermKind ("fixed" or "perpetual", default "fixed"), '
    "confidentialityTermYears (default 1), modifications"
)


class PartyFields(BaseModel):
    # Field names intentionally match the frontend's `NdaFormData` shape
    # exactly, so the JSON round-trips with no mapping layer on either side.
    company: str = ""
    signatoryName: str = ""
    title: str = ""
    noticeAddress: str = ""


class NdaFields(BaseModel):
    party1: PartyFields = PartyFields()
    party2: PartyFields = PartyFields()
    purpose: str = ""
    effectiveDate: str = ""
    mndaTermKind: Literal["fixed", "untilTerminated"] = "fixed"
    mndaTermYears: int = 1
    confidentialityTermKind: Literal["fixed", "perpetual"] = "fixed"
    confidentialityTermYears: int = 1
    governingLaw: str = ""
    jurisdiction: str = ""
    modifications: str = ""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    fields: NdaFields


class ChatResponse(BaseModel):
    reply: str
    fields: NdaFields


def _system_prompt(fields: NdaFields) -> str:
    return (
        "You are a friendly assistant helping someone fill in a Common Paper "
        "Mutual NDA cover page through freeform conversation, instead of a form.\n\n"
        "Ask about a couple of fields at a time, in a natural order, and extract "
        "answers from whatever the user writes. Once every required field has a "
        "real value, say so and invite them to review the preview.\n\n"
        f"Required fields: {REQUIRED_FIELDS}.\n"
        f"Optional fields: {OPTIONAL_FIELDS}.\n\n"
        "Current known values (JSON):\n"
        f"{json.dumps(fields.model_dump(), indent=2)}\n\n"
        "Your structured response must always contain the COMPLETE current "
        "snapshot of every field, carrying forward values you already know - "
        "not just the ones the user just gave you."
    )


def run_chat(request: ChatRequest) -> ChatResponse:
    messages = [{"role": "system", "content": _system_prompt(request.fields)}] + [
        {"role": message.role, "content": message.content} for message in request.messages
    ]
    response = completion(
        model=MODEL,
        messages=messages,
        response_format=ChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    return ChatResponse.model_validate_json(response.choices[0].message.content)
