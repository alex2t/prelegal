"""Mirrors the document list in the repo root's catalog.json.

Used to route a freeform request to a supported document, or explain why an
unsupported one isn't available yet and suggest the closest supported match.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class DocumentInfo:
    id: str
    name: str
    description: str
    supported: bool


CATALOG: list[DocumentInfo] = [
    DocumentInfo(
        "mutual_nda",
        "Mutual Non-Disclosure Agreement",
        "Lets two parties exchange confidential information for evaluating a "
        "potential business relationship.",
        supported=True,
    ),
    DocumentInfo(
        "design_partner_agreement",
        "Design Partner Agreement",
        "For an early customer collaborating with a vendor on product "
        "development: collaboration scope, feedback, IP ownership, "
        "confidentiality, and optional early access.",
        supported=True,
    ),
    DocumentInfo(
        "cloud_service_agreement",
        "Cloud Service Agreement",
        "Governs subscription access to a SaaS/cloud product: support, user "
        "accounts, usage data, privacy, payment, and liability.",
        supported=False,
    ),
    DocumentInfo(
        "service_level_agreement",
        "Service Level Agreement",
        "Defines uptime commitments, how availability is measured, and "
        "service credits owed when commitments are missed. Attaches to a "
        "Cloud Service Agreement.",
        supported=False,
    ),
    DocumentInfo(
        "professional_services_agreement",
        "Professional Services Agreement",
        "For statement-of-work-based consulting or implementation work: "
        "services and SOWs, fees, IP in deliverables, warranties, liability.",
        supported=False,
    ),
    DocumentInfo(
        "data_processing_agreement",
        "Data Processing Agreement",
        "Addresses GDPR/UK GDPR controller, processor, and subprocessor "
        "relationships, international data transfers, and security measures.",
        supported=False,
    ),
    DocumentInfo(
        "software_license_agreement",
        "Software License Agreement",
        "For licensing installed or downloadable software: license scope and "
        "restrictions, delivery and support, payment, warranties, liability.",
        supported=False,
    ),
    DocumentInfo(
        "partnership_agreement",
        "Partnership Agreement",
        "For a commercial partnership (referral, reseller, co-marketing) "
        "between two companies: responsibilities, fees, IP and marketing "
        "rights, term.",
        supported=False,
    ),
    DocumentInfo(
        "business_associate_agreement",
        "Business Associate Agreement",
        "HIPAA agreement setting out a business associate's obligations for "
        "protected health information.",
        supported=False,
    ),
    DocumentInfo(
        "pilot_agreement",
        "Pilot Agreement",
        "For a time-limited paid or free evaluation of a product: pilot "
        "access and scope, fees, pilot period and success criteria.",
        supported=True,
    ),
    DocumentInfo(
        "ai_addendum",
        "AI Addendum",
        "Supplements an existing agreement with terms for AI products and "
        "features: training on customer data, ownership of inputs/outputs.",
        supported=False,
    ),
]


def catalog_prompt() -> str:
    lines = [
        f"- {doc.name}{' [SUPPORTED]' if doc.supported else ''}: {doc.description}"
        for doc in CATALOG
    ]
    return "Available document templates:\n" + "\n".join(lines)
