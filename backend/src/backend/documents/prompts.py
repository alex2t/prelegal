"""Shared system-prompt builder for the per-document field-filling chat."""

import json

from pydantic import BaseModel


def build_system_prompt(
    document_name: str, required_fields: str, optional_fields: str, fields: BaseModel
) -> str:
    return (
        f"You are a friendly assistant helping someone fill in a Common Paper "
        f"{document_name} through freeform conversation, instead of a form.\n\n"
        "Ask about a couple of fields at a time, in a natural order, and extract "
        "answers from whatever the user writes. Once every required field has a "
        "real value, say so and invite them to review the preview.\n\n"
        f"Required fields: {required_fields}.\n"
        f"Optional fields: {optional_fields}.\n\n"
        "Current known values (JSON):\n"
        f"{json.dumps(fields.model_dump(), indent=2)}\n\n"
        "Your structured response must always contain the COMPLETE current "
        "snapshot of every field, carrying forward values you already know - "
        "not just the ones the user just gave you."
    )
