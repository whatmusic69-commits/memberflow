import { ApiError } from "./client";
export type UploadProgress = {
  stage: "reading" | "uploading" | "processing" | "complete";
  percent: number | null;
};
/** Browser transport only: reports bytes sent; the backend owns media persistence. */
export function uploadMultipart<T>(
  path: `/api/${string}`,
  body: FormData,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const origin = process.env.NEXT_PUBLIC_API_URL;
    if (!origin) {
      reject(new Error("unavailable"));
      return;
    }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const clean = () => signal?.removeEventListener("abort", abort);
    xhr.open("POST", `${origin.replace(/\/$/, "")}${path}`);
    xhr.withCredentials = true;
    xhr.timeout = 60000;
    xhr.setRequestHeader("Accept", "application/json");
    xhr.upload.onprogress = (event) =>
      onProgress?.({
        stage: "uploading",
        percent: event.lengthComputable
          ? Math.round((event.loaded / event.total) * 100)
          : null,
      });
    xhr.upload.onload = () =>
      onProgress?.({ stage: "processing", percent: 100 });
    xhr.onload = () => {
      clean();
      let result: unknown;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Invalid upload response"));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new ApiError(xhr.status, result));
        return;
      }
      onProgress?.({ stage: "complete", percent: 100 });
      resolve(result as T);
    };
    xhr.onerror = () => {
      clean();
      reject(new Error("Network error"));
    };
    xhr.ontimeout = () => {
      clean();
      reject(new Error("Upload timed out"));
    };
    xhr.onabort = () => {
      clean();
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    onProgress?.({ stage: "uploading", percent: 0 });
    xhr.send(body);
  });
}
