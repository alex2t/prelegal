"""Service Level Agreement field schema and chat-turn shape.

In Common Paper's actual design, the SLA Standard Terms have no fields of
their own - they attach to a Cloud Service Agreement and every variable used
in them (Target Uptime, Support Channel, etc.) lives on that CSA's Order
Form, so the SLA cannot stand alone. This app does not yet support documents
attaching to other documents, so - following the same simplification already
used for the Design Partner Agreement and Pilot Agreement - this module
invents a minimal standalone "Order Form" with generic party/date/
governing-law scaffolding fields plus the SLA's own variables, so the SLA can
be generated as its own complete, signable document.
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Service Level Agreement order form"

REQUIRED_FIELDS = (
    "provider, customer, effectiveDate (YYYY-MM-DD), governingLaw (the US "
    'state name only, e.g. "Delaware"), chosenCourts (the courts, e.g. "New '
    'Castle County, Delaware")'
)
OPTIONAL_FIELDS = (
    'targetUptime (default "99.9%"), targetResponseTime (default "24 '
    'hours"), supportChannel (how support requests are submitted, default '
    '"Email support."), uptimeCredit (the service credit owed when uptime '
    'falls short, default "None."), responseTimeCredit (the service credit '
    'owed when response time falls short, default "None."), '
    'subscriptionPeriod (default "12 months")'
)


class ServiceLevelFields(BaseModel):
    provider: str = ""
    customer: str = ""
    effectiveDate: str = ""
    governingLaw: str = ""
    chosenCourts: str = ""
    targetUptime: str = ""
    targetResponseTime: str = ""
    supportChannel: str = ""
    uptimeCredit: str = ""
    responseTimeCredit: str = ""
    subscriptionPeriod: str = ""


class ServiceLevelChatTurn(BaseModel):
    reply: str
    fields: ServiceLevelFields


def system_prompt(fields: ServiceLevelFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
