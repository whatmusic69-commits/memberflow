import type { UploadProgress } from "@/lib/api/upload";
/** Real local file reading/decoding, not a simulated network upload. */
export async function prepareImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
) {
  const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => reader.abort();
    const clean = () => signal?.removeEventListener("abort", abort);
    reader.onprogress = (event) =>
      onProgress?.({
        stage: "reading",
        percent: event.lengthComputable
          ? Math.round((event.loaded / event.total) * 100)
          : null,
      });
    reader.onload = () => {
      clean();
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = () => {
      clean();
      reject(reader.error);
    };
    reader.onabort = () => {
      clean();
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    onProgress?.({ stage: "reading", percent: 0 });
    reader.readAsArrayBuffer(file);
  });
  onProgress?.({ stage: "processing", percent: 100 });
  const blob = new Blob([bytes], { type: file.type });
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    bitmap.close();
  } else {
    const url = URL.createObjectURL(blob);
    try {
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("image"));
        image.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  onProgress?.({ stage: "complete", percent: 100 });
  return URL.createObjectURL(file);
}
