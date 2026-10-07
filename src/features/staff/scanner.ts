export type CameraState =
  | "idle"
  | "requesting"
  | "scanning"
  | "denied"
  | "unsupported"
  | "notFound"
  | "error";
interface Detector {
  detect(video: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}
type DetectorConstructor = new (options: { formats: string[] }) => Detector;
/** Camera decoding only. QR identities and customer resolution remain backend-owned. */
export async function startQrScanner(
  video: HTMLVideoElement,
  signal: AbortSignal,
  onState: (state: CameraState) => void,
  onCode: (code: string) => void,
) {
  const Detector = (
    window as unknown as { BarcodeDetector?: DetectorConstructor }
  ).BarcodeDetector;
  if (!Detector || !navigator.mediaDevices?.getUserMedia) {
    onState("unsupported");
    return;
  }
  let stream: MediaStream | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    clearTimeout(timer);
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };
  signal.addEventListener("abort", stop, { once: true });
  try {
    onState("requesting");
    const detector = new Detector({ formats: ["qr_code"] });
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    if (signal.aborted) {
      stop();
      return;
    }
    video.srcObject = stream;
    await video.play();
    if (signal.aborted) {
      stop();
      return;
    }
    onState("scanning");
    const detect = async () => {
      if (signal.aborted) return;
      try {
        const codes = await detector.detect(video);
        if (signal.aborted) return;
        const code = codes.find(
          (item) => item.rawValue.trim() && item.rawValue.length <= 2048,
        )?.rawValue;
        if (code) {
          stop();
          onCode(code);
          return;
        }
        timer = setTimeout(detect, 250);
      } catch {
        stop();
        if (!signal.aborted) onState("error");
      }
    };
    void detect();
  } catch (error) {
    stop();
    if (signal.aborted) return;
    onState(
      error instanceof DOMException && error.name === "NotAllowedError"
        ? "denied"
        : error instanceof DOMException && error.name === "NotFoundError"
          ? "notFound"
          : "error",
    );
  }
}
