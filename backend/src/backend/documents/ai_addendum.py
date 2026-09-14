"""AI Addendum field schema and chat-turn shape.

Common Paper's actual AI Addendum is a rider that supplements a separate
main Agreement and Product (see templates/AI-Addendum.md's references to
"the Agreement" and "the Product"). This app doesn't yet support documents
attaching to other documents, so - following the same simplification already
used for the Design Partner Agreement and Pilot Agreement - it is
standalone-ified here: instead of a live link to another document, users
describe the underlying agreement/product in a free-text
`baseAgreementDescription` field.
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "AI Addendum"

REQUIRED_FIELDS = (
    "provider, customer, effectiveDate (YYYY-MM-DD), baseAgreementDescription "
    "(what underlying agreement and product this addendum supplements, e.g. "
    '"the Cloud Service Agreement covering the Acme Analytics product")'
)
OPTIONAL_FIELDS = (
    "trainingDataUse (what data Provider may use to train or improve the "
    "Product's AI features, default \"Provider may use Customer's data to "
    "train and improve the Product's AI features, subject to the "
    'restrictions below."), trainingRestrictions (limits on that training '
    'use, default "None."), improvementRestrictions (limits on using data '
    'for non-training improvement, default "None.")'
)


class AiAddendumFields(BaseModel):
    provider: str = ""
    customer: str = ""
    effectiveDate: str = ""
    baseAgreementDescription: str = ""
    trainingDataUse: str = ""
    trainingRestrictions: str = ""
    improvementRestrictions: str = ""


class AiAddendumChatTurn(BaseModel):
    reply: str
    fields: AiAddendumFields


def system_prompt(fields: AiAddendumFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
