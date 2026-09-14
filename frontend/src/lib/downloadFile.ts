/** Triggers a browser download of a Blob. Shared by the creator and history pages. */
export async function triggerDownload(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Deferred rather than immediate: revoking the object URL right after
  // click() can race the browser actually reading the blob to save the
  // file (notably on Firefox), silently breaking the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
