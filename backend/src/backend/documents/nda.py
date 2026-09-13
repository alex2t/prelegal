"""Mutual NDA field schema and chat-turn shape."""

from typing import Literal

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Mutual NDA cover page"

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


class NdaChatTurn(BaseModel):
    reply: str
    fields: NdaFields


def system_prompt(fields: NdaFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
