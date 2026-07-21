"use client";

import { Camera, CheckCircle2, QrCode as QrIcon, Video, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { QrCode } from "@/components/ui/qr-code";
import { useDemoStore } from "@/store/demo-store";

type BarcodeDetectorResult = { rawValue: string };
type BarcodeDetectorInstance = { detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]> };
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function ScannerPage({ compact = false }: { compact?: boolean }) {
  const { selectedBusinessId, businesses, customers, programs, adjustCustomer, showToast } = useDemoStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const demoCustomers = customers.filter((customer) => customer.businessId === selectedBusinessId);
  const branches = businesses.find((business) => business.id === selectedBusinessId)?.branches ?? ["Main"];
  const [customerId, setCustomerId] = useState(demoCustomers[0]?.id ?? "");
  const [branch, setBranch] = useState(branches[0] ?? "Main");
  const [scanned, setScanned] = useState(false);
  const [confirm, setConfirm] = useState<null | "use_service" | "redeem_reward">(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastQrValue, setLastQrValue] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const customer = demoCustomers.find((item) => item.id === customerId);
  const sub = programs.find((item) => item.id === customer?.subscriptionProgramId && item.businessId === selectedBusinessId);
  const loy = programs.find((item) => item.id === customer?.loyaltyProgramId && item.businessId === selectedBusinessId);
  const activeBranch = branches.includes(branch) ? branch : branches[0] ?? "Main";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (!cameraActive) return;
    let cancelled = false;
    let timer: number | undefined;

    function handleDetectedQr(value: string) {
      const token = extractCustomerToken(value);
      setLastQrValue(value);
      const matched = customers.find((item) => item.token === token && item.businessId === selectedBusinessId);
      if (!matched) {
        showToast("QR клиента распознан, но для текущего бизнеса нет доступных программ.");
        setScanned(false);
        return;
      }
      setCustomerId(matched.id);
      setScanned(true);
      showToast("QR клиента распознан");
    }

    async function scanFrame() {
      const video = videoRef.current;
      if (cancelled || !video || !window.BarcodeDetector) return;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
          const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          const codes = await detector.detect(video);
          const value = codes[0]?.rawValue;
          if (value) {
            handleDetectedQr(value);
            stopCamera();
            return;
          }
        } catch {
          setCameraError("Не удалось распознать QR-код. Попробуйте поднести карту ближе или используйте demo-выбор клиента.");
        }
      }
      timer = window.setTimeout(scanFrame, 450);
    }

    timer = window.setTimeout(scanFrame, 300);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [cameraActive, customers, selectedBusinessId, showToast, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function startCamera() {
    setCameraError(null);
    setLastQrValue(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Браузер не поддерживает доступ к камере. Используйте demo-выбор клиента.");
      return;
    }
    if (!window.BarcodeDetector) {
      setCameraError("Браузер открыл камеру, но не поддерживает нативное распознавание QR. Используйте Chrome/Edge или demo-выбор клиента.");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError("Нет доступа к камере. Разрешите доступ в браузере или используйте demo-выбор клиента.");
    }
  }

  function completeAction(action: "use_service" | "add_stamp" | "redeem_reward") {
    if (!customer) return;
    adjustCustomer(customer.id, action, activeBranch);
    const labels = {
      use_service: "Услуга списана и операция добавлена в историю",
      add_stamp: "Штамп начислен и прогресс обновлён",
      redeem_reward: "Награда использована и сохранена в истории",
    };
    setSuccessMessage(labels[action]);
    window.setTimeout(() => setSuccessMessage(null), 2600);
  }

  return (
    <div className={compact ? "mx-auto max-w-2xl space-y-5" : "mx-auto max-w-4xl space-y-6"}>
      {!compact ? <div><h1 className="text-2xl font-semibold">Сканировать</h1><p className="text-sm text-slate-500">Сотрудник сканирует единый QR клиента MemberFlow и видит только программы своего бизнеса.</p></div> : <div><h1 className="text-2xl font-semibold">Сканировать QR</h1><p className="text-sm text-slate-500">Наведите камеру на карту клиента. Данные клиента и программы определятся автоматически.</p></div>}
      <Card className="overflow-hidden shadow-[var(--shadow-md)]">
        <CardHeader title={compact ? "Камера" : "QR клиента"} description={compact ? `Текущая точка: ${activeBranch}` : "Персональный token не содержит email, телефон или открытый customerId."} />
        <div className={compact ? "grid gap-5 p-5" : "grid gap-6 p-5 md:grid-cols-[260px_1fr]"}>
          <div className="relative grid min-h-80 place-items-center overflow-hidden rounded-[24px] border border-violet-200 bg-[#121320] text-center text-white">
            <video ref={videoRef} className={cameraActive ? "absolute inset-0 h-full w-full object-cover" : "hidden"} playsInline muted autoPlay />
            {cameraActive ? <div className="absolute inset-0 bg-[#121320]/20" /> : null}
            <div className="absolute inset-8 rounded-[22px] border border-white/30" />
            <div className="scan-line absolute left-8 right-8 top-1/2 h-0.5 bg-[var(--primary-bright)] shadow-[0_0_18px_rgba(124,108,255,0.9)]" />
            <div className="relative">
              {cameraActive ? <Video className="mx-auto h-12 w-12 text-violet-200" /> : <Camera className="mx-auto h-12 w-12 text-violet-200" />}
              <p className="mt-3 text-sm font-semibold">{cameraActive ? "Камера активна" : "Область сканера"}</p>
              {!cameraActive && !compact ? <div className="mt-4"><QrCode label={customer?.token ?? "customer token"} value={`memberflow:customer:${customer?.token ?? "mfp_c_8f3k29x7"}`} /></div> : <p className="mt-3 max-w-48 text-xs text-slate-200">Наведите камеру на QR клиента MemberFlow</p>}
            </div>
          </div>
          <div className="space-y-4">
            {!compact ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm shadow-[var(--shadow-sm)]">{demoCustomers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
                <select value={activeBranch} onChange={(e) => setBranch(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm shadow-[var(--shadow-sm)]">{branches.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-[var(--foreground)]">Ожидание QR клиента</p>
                <p className="mt-1 text-slate-500">Клиент показывает единую карту MemberFlow. После сканирования сотрудник увидит только программы текущего бизнеса.</p>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {cameraActive ? <Button variant="secondary" onClick={stopCamera} className="w-full"><VideoOff className="h-4 w-4" />Остановить камеру</Button> : <Button onClick={startCamera} className="w-full"><Camera className="h-4 w-4" />Открыть камеру</Button>}
              <Button variant="secondary" onClick={() => { setScanned(true); setLastQrValue(`memberflow:customer:${customer?.token ?? "mfp_c_8f3k29x7"}`); }} className="w-full"><QrIcon className="h-4 w-4" />{compact ? "Симулировать QR" : "Demo-сканирование"}</Button>
            </div>
            {cameraError ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{cameraError}</div> : null}
            {lastQrValue ? <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500"><b className="text-slate-700">Последний QR:</b> {lastQrValue}</div> : null}
            {scanned && customer ? <div className="animate-fade-up space-y-4 rounded-[24px] bg-[var(--primary-soft)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex flex-wrap items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-[#20B486]" />{customer.name}<span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">{customer.customerNumber ?? "MF-000184"}</span><span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">{activeBranch}</span></div>
              {successMessage ? <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 className="mr-2 inline h-4 w-4" />{successMessage}</div> : null}
              {sub ? <Action title={sub.name} text={`Осталось услуг: ${customer.remainingUses} из ${customer.includedUses}`} action={<Button disabled={customer.remainingUses <= 0} onClick={() => setConfirm("use_service")}>Списать одну услугу</Button>} /> : null}
              {loy ? <Action title={loy.name} text={`Штампы: ${customer.stamps} из ${loy.targetCount ?? 5}`} action={<Button variant="secondary" onClick={() => completeAction("add_stamp")}>Добавить штамп</Button>} /> : null}
              {customer.rewards > 0 ? <Action title="Доступная награда" text={`${customer.rewards} · ${loy?.rewardName ?? "Reward"}`} action={<Button variant="secondary" onClick={() => setConfirm("redeem_reward")}>Использовать награду</Button>} /> : null}
              {!sub && !loy ? <Action title="Нет программ этого бизнеса" text="У клиента могут быть программы других компаний, но сотруднику они не показываются." action={null} /> : null}
            </div> : null}
          </div>
        </div>
      </Card>
      <ConfirmModal open={Boolean(confirm)} title="Подтвердить действие" text="Операция будет записана в demo-историю и изменит данные клиента." onClose={() => setConfirm(null)} onConfirm={() => confirm && completeAction(confirm)} />
    </div>
  );
}

function Action({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p><div className="mt-3">{action}</div></div>;
}

function extractCustomerToken(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("memberflow:customer:")) return trimmed.replace("memberflow:customer:", "");
  const match = trimmed.match(/mfp_c_[a-z0-9_]+/i);
  return match?.[0] ?? trimmed;
}
