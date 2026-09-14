"""Professional Services Agreement field schema and chat-turn shape.

Common Paper's real PSA spec splits variables across two tiers: Key Terms
(agreement-level details like Provider, Customer, and Governing Law) and a
per-Statement-of-Work "SOW" tier (Deliverables, Fees, and similar per-engagement
details) referenced in templates/PSA.md via `keyterms_link` and `sow_link`
placeholders. For this MVP, both tiers are flattened into one flat field set -
there is no per-SOW repeating-group UI.
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Professional Services Agreement cover page"

REQUIRED_FIELDS = (
    "provider, customer, effectiveDate (YYYY-MM-DD), governingLaw (the US state "
    'name only, e.g. "Delaware"), chosenCourts (the courts, e.g. "New Castle '
    'County, Delaware")'
)
OPTIONAL_FIELDS = (
    'deliverables (what Provider will deliver, default "As mutually agreed in '
    'writing."), paymentPeriod (default "Net 30 days."), fees (default "As set '
    'forth in the applicable Statement of Work."), sowTerm (how long the '
    'engagement runs, default "Until completion of the Deliverables."), '
    'rejectionPeriod (how long Customer has to reject a Deliverable, default '
    '"10 days."), additionalWarranties (default "None."), generalCapAmount '
    '(each party\'s total liability cap, default "The total Fees paid under '
    'the applicable Statement of Work."), noticeAddress'
)


class ProfessionalServicesFields(BaseModel):
    provider: str = ""
    customer: str = ""
    effectiveDate: str = ""
    governingLaw: str = ""
    chosenCourts: str = ""
    deliverables: str = ""
    paymentPeriod: str = ""
    fees: str = ""
    sowTerm: str = ""
    rejectionPeriod: str = ""
    additionalWarranties: str = ""
    generalCapAmount: str = ""
    noticeAddress: str = ""


class ProfessionalServicesChatTurn(BaseModel):
    reply: str
    fields: ProfessionalServicesFields


def system_prompt(fields: ProfessionalServicesFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
