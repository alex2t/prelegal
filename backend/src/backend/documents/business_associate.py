"""Business Associate Agreement field schema and chat-turn shape.

Common Paper's real BAA is a rider that attaches to and depends on a
separate main "Agreement" (e.g. a Cloud Service Agreement) - it can't stand
alone. Like the Design Partner Agreement and Pilot Agreement, this app
doesn't yet support documents attaching to other documents, so instead of a
live link to another document, `baseAgreementDescription` is a plain
free-text field where the user describes what agreement this BAA attaches
to (e.g. "the Cloud Service Agreement dated January 1, 2026").
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Business Associate Agreement cover page"

REQUIRED_FIELDS = (
    "provider, company, effectiveDate (YYYY-MM-DD), baseAgreementDescription "
    "(the underlying agreement this BAA attaches to, e.g. \"the Cloud Service "
    "Agreement dated January 1, 2026\")"
)
OPTIONAL_FIELDS = (
    "limitations (restrictions on Provider's use or disclosure of PHI, "
    'default "None."), breachNotificationPeriod (how quickly Provider must '
    'report a breach to Company, default "5 business days.")'
)


class BusinessAssociateFields(BaseModel):
    provider: str = ""
    company: str = ""
    effectiveDate: str = ""
    baseAgreementDescription: str = ""
    limitations: str = ""
    breachNotificationPeriod: str = ""


class BusinessAssociateChatTurn(BaseModel):
    reply: str
    fields: BusinessAssociateFields


def system_prompt(fields: BusinessAssociateFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
