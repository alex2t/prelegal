"""Cloud Service Agreement field schema and chat-turn shape.

Like the Design Partner and Pilot Agreements, Common Paper's actual fill-in
Cover Page for this template isn't checked into templates/ - only the
Standard Terms are. The real spec splits its Variables across two tiers (a
per-subscription Order Form and party-level Key Terms, referenced via the
`orderform_link`/`keyterms_link` spans in templates/CSA.md); for this MVP
both tiers are flattened into one flat field set with no repeating
per-subscription groups.
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Cloud Service Agreement cover page"

REQUIRED_FIELDS = (
    "provider, customer, effectiveDate (YYYY-MM-DD), governingLaw (the US "
    'state name only, e.g. "Delaware"), chosenCourts (the courts, e.g. "New '
    'Castle County, Delaware")'
)
OPTIONAL_FIELDS = (
    'subscriptionPeriod (default "12 months"), technicalSupport (default '
    '"Standard support during business hours, Monday through Friday."), '
    'paymentProcess (default "Invoiced annually in advance."), '
    "nonRenewalNoticeDate (default \"30 days before the end of the "
    'Subscription Period."), useLimitations (default "None."), '
    "generalCapAmount (each party's total liability cap, default \"The "
    'total Fees paid in the 12 months before the claim."), '
    'additionalWarranties (default "None."), noticeAddress'
)


class CloudServiceFields(BaseModel):
    provider: str = ""
    customer: str = ""
    effectiveDate: str = ""
    governingLaw: str = ""
    chosenCourts: str = ""
    subscriptionPeriod: str = ""
    technicalSupport: str = ""
    paymentProcess: str = ""
    nonRenewalNoticeDate: str = ""
    useLimitations: str = ""
    generalCapAmount: str = ""
    additionalWarranties: str = ""
    noticeAddress: str = ""


class CloudServiceChatTurn(BaseModel):
    reply: str
    fields: CloudServiceFields


def system_prompt(fields: CloudServiceFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
