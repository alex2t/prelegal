"""Pilot Agreement field schema and chat-turn shape.

Like the Design Partner Agreement, Common Paper's actual fill-in "Order
Form" for this template isn't checked into templates/ - only the Standard
Terms are. These fields were derived from the `orderform_link` placeholders
referenced in templates/Pilot-Agreement.md (Provider, Customer, Effective
Date, Pilot Period, Governing Law, Chosen Courts, General Cap Amount,
Notice Address), plus Product and Fees from the Definitions section.
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Pilot Agreement order form"

REQUIRED_FIELDS = (
    "provider, customer, effectiveDate (YYYY-MM-DD), pilotPeriod (how long "
    'the pilot runs, e.g. "30 days"), governingLaw (the US state name only, '
    'e.g. "Delaware"), chosenCourts (the courts, e.g. "New Castle County, '
    'Delaware")'
)
OPTIONAL_FIELDS = (
    'product (what is being piloted, default "the Product being evaluated"), '
    'fees (default "None."), generalCapAmount (each party\'s total liability '
    'cap, default "The total Fees paid under this Agreement."), noticeAddress'
)


class PilotFields(BaseModel):
    provider: str = ""
    customer: str = ""
    product: str = ""
    fees: str = ""
    effectiveDate: str = ""
    pilotPeriod: str = ""
    governingLaw: str = ""
    chosenCourts: str = ""
    generalCapAmount: str = ""
    noticeAddress: str = ""


class PilotChatTurn(BaseModel):
    reply: str
    fields: PilotFields


def system_prompt(fields: PilotFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
