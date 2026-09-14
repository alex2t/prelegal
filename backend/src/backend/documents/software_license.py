"""Software License Agreement field schema and chat-turn shape.

Fields mirror the `orderform_link`/`keyterms_link` placeholders referenced in
templates/Software-License-Agreement.md (Provider, Customer, Effective Date,
Governing Law, Chosen Courts, Subscription Period, Permitted Uses, License
Limits, Payment Process, Warranty Period, Additional Warranties, General Cap
Amount, Deletion Procedure). Several of these normally require legal drafting
judgment - this app takes them verbatim from the user rather than having the
AI compose legal language.
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Software License Agreement cover page"

REQUIRED_FIELDS = (
    "provider, customer, effectiveDate (YYYY-MM-DD), governingLaw (the US "
    'state name only, e.g. "Delaware"), chosenCourts (the courts, e.g. "New '
    'Castle County, Delaware")'
)
OPTIONAL_FIELDS = (
    'subscriptionPeriod (how long the license subscription runs, default '
    '"12 months"), permittedUses (what Customer may use the Software for, '
    'default "Internal business purposes."), licenseLimits (any '
    'restrictions on Customer\'s use of the Software, default "None '
    'specified."), paymentProcess (how and when Fees are invoiced or '
    'charged, default "Invoiced annually in advance."), warrantyPeriod (how '
    'long Provider\'s warranty for the Software lasts, default "90 days."), '
    'additionalWarranties (any extra warranties Provider makes, default '
    '"None."), generalCapAmount (each party\'s total liability cap, default '
    '"The total Fees paid in the 12 months before the claim."), '
    'deletionProcedure (how Customer must remove the Software after '
    'termination, default "Provider will delete Customer data within 30 '
    'days of termination.")'
)


class SoftwareLicenseFields(BaseModel):
    provider: str = ""
    customer: str = ""
    effectiveDate: str = ""
    governingLaw: str = ""
    chosenCourts: str = ""
    subscriptionPeriod: str = ""
    permittedUses: str = ""
    licenseLimits: str = ""
    paymentProcess: str = ""
    warrantyPeriod: str = ""
    additionalWarranties: str = ""
    generalCapAmount: str = ""
    deletionProcedure: str = ""


class SoftwareLicenseChatTurn(BaseModel):
    reply: str
    fields: SoftwareLicenseFields


def system_prompt(fields: SoftwareLicenseFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
