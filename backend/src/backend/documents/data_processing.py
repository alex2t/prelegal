"""Data Processing Agreement field schema and chat-turn shape.

Common Paper's real DPA Cover Page requires GDPR-specific structured annexes
(subprocessor lists, categories of personal data as tables, per-module SCC
selections). For this MVP, every such annex is simplified into a single
plain-text field (e.g. a freeform description of categories or approved
subprocessors) rather than a table or repeating-group UI, matching the
"simple fill-in only" policy used for every other document in this app.
"""

from pydantic import BaseModel

from backend.documents.prompts import build_system_prompt

DOCUMENT_NAME = "Data Processing Agreement Cover Page"

REQUIRED_FIELDS = (
    "controller, processor, effectiveDate (YYYY-MM-DD), governingMemberState "
    '(the EU member state whose law governs, e.g. "Ireland"), '
    "categoriesOfPersonalData (e.g. \"Name, email address, IP address\"), "
    "categoriesOfDataSubjects (e.g. \"Customer's employees and end users\"), "
    "purposeOfProcessing (why the personal data is processed)"
)
OPTIONAL_FIELDS = (
    'durationOfProcessing (default "The term of the Agreement."), '
    'specialCategoryData (default "None."), approvedSubprocessors (a '
    'freeform list of names and locations, default "None."), '
    "providerSecurityContact (an email or contact name for security "
    "due-diligence requests)"
)


class DataProcessingFields(BaseModel):
    controller: str = ""
    processor: str = ""
    effectiveDate: str = ""
    governingMemberState: str = ""
    categoriesOfPersonalData: str = ""
    categoriesOfDataSubjects: str = ""
    purposeOfProcessing: str = ""
    durationOfProcessing: str = ""
    specialCategoryData: str = ""
    approvedSubprocessors: str = ""
    providerSecurityContact: str = ""


class DataProcessingChatTurn(BaseModel):
    reply: str
    fields: DataProcessingFields


def system_prompt(fields: DataProcessingFields) -> str:
    return build_system_prompt(DOCUMENT_NAME, REQUIRED_FIELDS, OPTIONAL_FIELDS, fields)
