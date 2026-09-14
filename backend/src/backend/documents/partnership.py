"""Partnership Agreement field schema and chat-turn shape.

Common Paper's actual fill-in "Cover Page" for this template isn't checked
into templates/ - only the Standard Terms are. These fields were derived from
the `keyterms_link`/`businessterms_link` placeholders referenced in
templates/Partnership-Agreement.md (Company, Partner, Effective Date,
Governing Law, Chosen Courts, Obligations, Payment Process, Payment Schedule,
Territory, End Date, Brand Guidelines, Additional Warranties, General Cap
Amount).
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Partnership Agreement cover page"

REQUIRED_FIELDS = (
    "company, partner, effectiveDate (YYYY-MM-DD), governingLaw (the US state "
    'name only, e.g. "Delaware"), chosenCourts (the courts, e.g. "New Castle '
    'County, Delaware"), obligations (what each party will actually do under '
    "the partnership - record this in the user's own words, verbatim, rather "
    "than drafting or expanding on it)"
)
OPTIONAL_FIELDS = (
    'paymentProcess (default "As mutually agreed in writing."), '
    'paymentSchedule (default "Monthly."), territory (default "Worldwide."), '
    'endDate (default "Until terminated by either party."), brandGuidelines '
    '(default "None."), additionalWarranties (default "None."), '
    "generalCapAmount (each party's total liability cap, default \"The total "
    'Fees paid in the 12 months before the claim.")'
)


class PartnershipFields(BaseModel):
    company: str = ""
    partner: str = ""
    effectiveDate: str = ""
    governingLaw: str = ""
    chosenCourts: str = ""
    obligations: str = ""
    paymentProcess: str = ""
    paymentSchedule: str = ""
    territory: str = ""
    endDate: str = ""
    brandGuidelines: str = ""
    additionalWarranties: str = ""
    generalCapAmount: str = ""


class PartnershipChatTurn(BaseModel):
    reply: str
    fields: PartnershipFields


def system_prompt(fields: PartnershipFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
