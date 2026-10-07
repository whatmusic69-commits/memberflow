"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, Square } from "lucide-react";
import type { StaffContent } from "@/content/staff";
import { startQrScanner, type CameraState } from "./scanner";
export function CameraScanner({
  c,
  onCode,
  disabled,
  initialState = "idle",
}: {
  c: StaffContent;
  onCode: (code: string) => void;
  disabled: boolean;
  initialState?: CameraState;
}) {
  const [state, setState] = useState<CameraState>(initialState);
  const video = useRef<HTMLVideoElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  function stop() {
    controller.current?.abort();
    setState("idle");
  }
  function start() {
    if (!video.current) return;
    controller.current?.abort();
    controller.current = new AbortController();
    void startQrScanner(
      video.current,
      controller.current.signal,
      setState,
      (code) => {
        controller.current?.abort();
        setState("idle");
        onCode(code);
      },
    );
  }
  const active = state === "requesting" || state === "scanning";
  return (
    <section className="mf-scanner">
      <div
        className={`mf-scanner-frame ${state === "scanning" ? "is-scanning" : ""}`}
      >
        <video ref={video} autoPlay playsInline muted aria-hidden="true" />
        {!active && <ScanLine size={62} strokeWidth={1} aria-hidden="true" />}
        <div className="mf-scanner-guide" aria-hidden="true" />
      </div>
      <p role="status">{disabled ? c.resolving : c.states[state]}</p>
      {active ? (
        <button className="button mf-staff-primary" onClick={stop}>
          <Square size={18} />
          {c.stopCamera}
        </button>
      ) : (
        <button
          className="button button-primary mf-staff-primary"
          disabled={disabled}
          onClick={start}
        >
          <Camera size={20} />
          {c.startCamera}
        </button>
      )}
    </section>
  );
}
