"""Design Partner Agreement field schema and chat-turn shape.

Unlike the Mutual NDA, Common Paper's actual fill-in "Cover Page" for this
template isn't checked into templates/ - only the Standard Terms are. These
fields were derived from the `keyterms_link` placeholders referenced in
templates/Design-Partner-Agreement.md (Partner, Provider, Program, Fees,
Term, Effective Date, Governing Law, Chosen Courts, Notice Address).
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Design Partner Agreement cover page"

REQUIRED_FIELDS = (
    "provider, partner, effectiveDate (YYYY-MM-DD), governingLaw (the US state "
    'name only, e.g. "Delaware"), chosenCourts (the courts, e.g. "New Castle '
    'County, Delaware")'
)
OPTIONAL_FIELDS = (
    'program (what the partner gets early access to and gives feedback on, '
    'default "early access to the product in exchange for feedback"), fees '
    '(default "None."), term (default "12 months"), noticeAddress'
)


class DesignPartnerFields(BaseModel):
    provider: str = ""
    partner: str = ""
    program: str = ""
    fees: str = ""
    effectiveDate: str = ""
    term: str = ""
    governingLaw: str = ""
    chosenCourts: str = ""
    noticeAddress: str = ""


class DesignPartnerChatTurn(BaseModel):
    reply: str
    fields: DesignPartnerFields


def system_prompt(fields: DesignPartnerFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
