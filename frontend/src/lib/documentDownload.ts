/** Generates and downloads a document's PDF. Shared by the creator and history pages. */

import { DocumentType } from "./documentChat";
import { DOCUMENT_REGISTRY, type FieldData } from "./documentRegistry";
import { triggerDownload } from "./downloadFile";

export async function downloadForDocument(documentType: DocumentType, fields: FieldData): Promise<void> {
  const config = DOCUMENT_REGISTRY[documentType];
  const generateBlob = await config.loadGenerateBlob();
  const blob = await generateBlob(fields);
  await triggerDownload(blob, `${config.filenamePrefix}-${config.fileSlug(fields)}.pdf`);
}
