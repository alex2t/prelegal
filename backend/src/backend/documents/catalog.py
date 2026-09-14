"""Mirrors the document list in the repo root's catalog.json.

Used by the chat's router to pick which document a freeform request is for.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class DocumentInfo:
    id: str
    name: str
    description: str


CATALOG: list[DocumentInfo] = [
    DocumentInfo(
        "mutual_nda",
        "Mutual Non-Disclosure Agreement",
        "Lets two parties exchange confidential information for evaluating a "
        "potential business relationship.",
    ),
    DocumentInfo(
        "design_partner_agreement",
        "Design Partner Agreement",
        "For an early customer collaborating with a vendor on product "
        "development: collaboration scope, feedback, IP ownership, "
        "confidentiality, and optional early access.",
    ),
    DocumentInfo(
        "cloud_service_agreement",
        "Cloud Service Agreement",
        "Governs subscription access to a SaaS/cloud product: support, user "
        "accounts, usage data, privacy, payment, and liability.",
    ),
    DocumentInfo(
        "service_level_agreement",
        "Service Level Agreement",
        "Defines uptime commitments, how availability is measured, and "
        "service credits owed when commitments are missed. Attaches to a "
        "Cloud Service Agreement.",
    ),
    DocumentInfo(
        "professional_services_agreement",
        "Professional Services Agreement",
        "For statement-of-work-based consulting or implementation work: "
        "services and SOWs, fees, IP in deliverables, warranties, liability.",
    ),
    DocumentInfo(
        "data_processing_agreement",
        "Data Processing Agreement",
        "Addresses GDPR/UK GDPR controller, processor, and subprocessor "
        "relationships, international data transfers, and security measures.",
    ),
    DocumentInfo(
        "software_license_agreement",
        "Software License Agreement",
        "For licensing installed or downloadable software: license scope and "
        "restrictions, delivery and support, payment, warranties, liability.",
    ),
    DocumentInfo(
        "partnership_agreement",
        "Partnership Agreement",
        "For a commercial partnership (referral, reseller, co-marketing) "
        "between two companies: responsibilities, fees, IP and marketing "
        "rights, term.",
    ),
    DocumentInfo(
        "business_associate_agreement",
        "Business Associate Agreement",
        "HIPAA agreement setting out a business associate's obligations for "
        "protected health information.",
    ),
    DocumentInfo(
        "pilot_agreement",
        "Pilot Agreement",
        "For a time-limited paid or free evaluation of a product: pilot "
        "access and scope, fees, pilot period and success criteria.",
    ),
    DocumentInfo(
        "ai_addendum",
        "AI Addendum",
        "Supplements an existing agreement with terms for AI products and "
        "features: training on customer data, ownership of inputs/outputs.",
    ),
]


def catalog_prompt() -> str:
    lines = [f"- {doc.name}: {doc.description}" for doc in CATALOG]
    return "Available document templates:\n" + "\n".join(lines)
