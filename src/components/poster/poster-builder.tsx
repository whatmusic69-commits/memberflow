"use client";

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Copy, Download, FileDown, Printer, RotateCcw, Upload } from "lucide-react";
import Image from "next/image";
import { forwardRef, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { QrCode } from "@/components/ui/qr-code";
import { cn } from "@/lib/utils";
import memberflowMark from "@/img/memberflow-logo-source.svg";
import type { Business, Program, ProgramType } from "@/types";

type PosterTheme = "light" | "dark";
type PosterTemplate = "minimal" | "brand" | "poster";
type PreviewMode = "fit" | "75" | "100";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface PosterSettings {
  title: string;
  description: string;
  cta: string;
  businessName: string;
  brandColor: string;
  theme: PosterTheme;
  template: PosterTemplate;
  showInstruction: boolean;
  logoDataUrl?: string;
}

export function PosterBuilder({ business, program, source = "onboarding" }: { business?: Business; program?: Program; source?: "onboarding" | "dashboard" }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const defaults = useMemo(() => getDefaultSettings(business, program), [business, program]);
  const storageKey = `memberflow-poster-${program?.id ?? "new"}-${source}`;
  const [settings, setSettings] = useState<PosterSettings>(() => readStoredSettings(storageKey, defaults));
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("fit");
  const [previewWidth, setPreviewWidth] = useState(A4_WIDTH);
  const programType: ProgramType = program?.type ?? "loyalty";
  const joinPath = programType === "subscription" ? `/subscribe/${program?.id ?? "program"}` : `/join/${program?.id ?? "program"}`;
  const qrValue = `https://memberflow.app${joinPath}`;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);

  useEffect(() => {
    const node = previewContainerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setPreviewWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fitScale = Math.min(1, previewWidth / A4_WIDTH);
  const previewScale = previewMode === "fit" ? fitScale : previewMode === "75" ? 0.75 : 1;

  function updateSetting<Key extends keyof PosterSettings>(key: Key, value: PosterSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleLogo(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSetting("logoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  }

  async function exportPng() {
    if (!posterRef.current) return;
    const dataUrl = await renderPosterPng(posterRef.current, settings);
    downloadDataUrl(dataUrl, `${program?.name ?? "memberflow"}-poster.png`);
  }

  async function exportPdf() {
    const pdf = await createPosterPdf();
    pdf.save(`${program?.name ?? "memberflow"}-poster.pdf`);
  }

  async function createPosterPdf() {
    if (!posterRef.current) throw new Error("Poster canvas is not ready");
    const image = await renderPosterPng(posterRef.current, settings);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.addImage(image, "PNG", 0, 0, 210, 297);
    return pdf;
  }

  async function printPoster() {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showToast("Разрешите всплывающие окна для печати");
      return;
    }

    printWindow.document.write("<!doctype html><title>Печать плаката</title><body style=\"font-family:Arial,sans-serif;padding:24px\">Подготовка плаката...</body>");

    try {
      const pdf = await createPosterPdf();
      pdf.autoPrint();

      const blobUrl = URL.createObjectURL(pdf.output("blob"));
      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>Печать плаката</title>
            <style>
              html, body {
                margin: 0;
                height: 100%;
                background: #f4f5f9;
                font-family: Arial, sans-serif;
              }
              .toolbar {
                position: fixed;
                top: 12px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2;
                display: flex;
                gap: 10px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.94);
                box-shadow: 0 12px 34px rgba(18, 19, 32, 0.16);
              }
              button {
                border: 0;
                border-radius: 10px;
                background: #6D5DFB;
                color: white;
                font-weight: 700;
                padding: 10px 14px;
                cursor: pointer;
              }
              span {
                color: #626A7A;
                font-size: 13px;
                font-weight: 600;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: 0;
                background: white;
              }
              @media print {
                .toolbar { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <button type="button" onclick="printPdf()">Печать</button>
              <span>Если окно печати не открылось автоматически, нажмите кнопку.</span>
            </div>
            <iframe id="posterPdf" src="${blobUrl}"></iframe>
            <script>
              function printPdf() {
                var frame = document.getElementById('posterPdf');
                frame.contentWindow.focus();
                frame.contentWindow.print();
              }
              document.getElementById('posterPdf').addEventListener('load', function () {
                setTimeout(printPdf, 500);
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      printWindow.close();
      showToast("Не удалось подготовить печать");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(joinPath);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  return (
    <div className="poster-builder grid items-start gap-10 min-[1100px]:grid-cols-[minmax(380px,0.8fr)_minmax(600px,1.2fr)]">
      {toast ? <div className="no-print fixed bottom-5 right-5 z-50 rounded-2xl bg-[#121320] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)]">{toast}</div> : null}
      <Card className="no-print h-fit p-5 lg:sticky lg:top-20">
        <CardHeader title="Плакат с QR-кодом" description="QR для подключения: клиенты сканируют его, чтобы присоединиться к программе." />
        <div className="space-y-4 p-1 pt-5">
          <Field label="Заголовок"><input maxLength={72} value={settings.title} onChange={(event) => updateSetting("title", event.target.value)} className={inputClass} /></Field>
          <Field label="Описание"><textarea maxLength={150} value={settings.description} onChange={(event) => updateSetting("description", event.target.value)} className={cn(inputClass, "min-h-20 py-3")} /></Field>
          <Field label="Призыв"><input maxLength={64} value={settings.cta} onChange={(event) => updateSetting("cta", event.target.value)} className={inputClass} /></Field>
          <Field label="Название бизнеса"><input maxLength={42} value={settings.businessName} onChange={(event) => updateSetting("businessName", event.target.value)} className={inputClass} /></Field>
          <Field label="Логотип"><label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-600 hover:bg-white"><Upload className="h-4 w-4" />Загрузить<input type="file" accept="image/*" className="hidden" onChange={(event) => handleLogo(event.target.files?.[0])} /></label></Field>
          <Field label="Цвет бренда"><input type="color" value={settings.brandColor} onChange={(event) => updateSetting("brandColor", event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-white p-1 shadow-[var(--shadow-sm)]" /></Field>
          <Field label="Тема">
            <div className="grid grid-cols-2 gap-2">
              {(["light", "dark"] as const).map((theme) => <button key={theme} type="button" onClick={() => updateSetting("theme", theme)} className={cn(toggleClass, settings.theme === theme && activeToggleClass)}>{theme === "light" ? "Светлая" : "Тёмная"}</button>)}
            </div>
          </Field>
          <Field label="Шаблон">
            <div className="grid grid-cols-3 gap-2">
              {(["minimal", "brand", "poster"] as const).map((template) => <button key={template} type="button" onClick={() => updateSetting("template", template)} className={cn(toggleClass, "capitalize", settings.template === template && activeToggleClass)}>{template}</button>)}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={settings.showInstruction} onChange={(event) => updateSetting("showInstruction", event.target.checked)} />Показать инструкцию</label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setSettings(defaults)}><RotateCcw className="h-4 w-4" />Сбросить</Button>
            <Button variant="secondary" onClick={copyLink}><Copy className="h-4 w-4" />{copied ? "Скопировано" : "Ссылка"}</Button>
            <Button onClick={exportPng}><Download className="h-4 w-4" />PNG</Button>
            <Button onClick={exportPdf}><FileDown className="h-4 w-4" />PDF</Button>
            <Button variant="secondary" onClick={printPoster}><Printer className="h-4 w-4" />Печать</Button>
            <Button onClick={() => window.location.href = "/dashboard"}>Завершить</Button>
          </div>
        </div>
      </Card>

      <div className="min-w-0">
        <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>Живое превью A4 · QR для подключения ведёт на <b className="text-slate-700">{joinPath}</b></span>
          <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-white p-1 shadow-[var(--shadow-sm)]">
            {([
              ["fit", "Вписать целиком"],
              ["75", "75%"],
              ["100", "100%"],
            ] as const).map(([mode, label]) => (
              <button key={mode} type="button" onClick={() => setPreviewMode(mode)} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition", previewMode === mode ? "bg-[var(--primary)] text-white" : "text-slate-500 hover:bg-slate-50")}>{label}</button>
            ))}
          </div>
        </div>
        <div ref={previewContainerRef} className="overflow-auto rounded-[28px] bg-slate-200/70 p-4 shadow-inner">
          <div className="mx-auto flex-shrink-0" style={{ width: A4_WIDTH * previewScale, height: A4_HEIGHT * previewScale }}>
            <div style={{ width: A4_WIDTH, height: A4_HEIGHT, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
              <PosterPreview ref={posterRef} settings={settings} qrValue={qrValue} joinPath={joinPath} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
const toggleClass = "rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
const activeToggleClass = "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>;
}

const PosterPreview = forwardPosterPreview();

function forwardPosterPreview() {
  const Component = function PosterPreviewInner({ settings, qrValue, joinPath }: { settings: PosterSettings; qrValue: string; joinPath: string }, ref: React.Ref<HTMLDivElement>) {
    const dark = settings.theme === "dark";
    const canvasStyle = getPosterCanvasStyle(settings);
    return (
      <div
        ref={ref}
        className={cn(
          "poster-canvas poster-print-area relative flex flex-shrink-0 flex-col overflow-hidden p-[56px] shadow-[0_24px_80px_rgba(18,19,32,0.18)]",
          `template-${settings.template}`,
          `theme-${settings.theme}`,
        )}
        style={canvasStyle}
      >
        {settings.template === "poster" ? <><span className="absolute -right-24 top-20 h-64 w-64 rounded-full opacity-30 blur-2xl" style={{ background: settings.brandColor }} /><span className="absolute -left-16 bottom-24 h-52 w-52 rounded-full bg-white/10" /></> : null}
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {settings.logoDataUrl ? <Image src={settings.logoDataUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-2xl object-cover" unoptimized /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white" style={{ background: settings.brandColor }}>{settings.businessName[0] ?? "M"}</span>}
            <p className="truncate text-xl font-semibold">{settings.businessName}</p>
          </div>
        </div>
        <div className="relative mt-[13%]">
          <h2 className="max-w-[92%] text-5xl font-semibold leading-[1.02] tracking-tight">{settings.title}</h2>
          <p className={cn("mt-5 max-w-[82%] text-xl leading-8", dark || settings.template === "poster" ? "text-slate-300" : "text-slate-600")}>{settings.description}</p>
        </div>
        <div className="relative mt-auto grid place-items-center">
          <div className="rounded-[32px] bg-white p-5 shadow-[0_18px_50px_rgba(18,19,32,0.16)]">
            <QrCode label="" value={qrValue} size={220} />
          </div>
          <p className="mt-5 text-center text-2xl font-semibold">{settings.cta}</p>
          <p className={cn("mt-2 text-sm font-semibold", dark || settings.template === "poster" ? "text-slate-300" : "text-slate-500")}>{joinPath}</p>
        </div>
        {settings.showInstruction ? <div className={cn("relative mt-9 grid grid-cols-3 gap-3 rounded-3xl p-4 text-center text-sm font-semibold", dark || settings.template === "poster" ? "bg-white/10 text-slate-200" : "bg-slate-50 text-slate-700")}><span>1. Отсканируйте</span><span>2. Получите карту</span><span>3. Пользуйтесь</span></div> : null}
        <div className="relative mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-[0_8px_24px_rgba(18,19,32,0.08)]">
            <Image src={memberflowMark} alt="" width={28} height={28} className="h-7 w-7 rounded-lg" />
            <span className="text-lg font-[750] tracking-tight text-[#121320]">Member<span style={{ color: "#6D5DFB" }}>Flow</span></span>
          </div>
        </div>
      </div>
    );
  };
  Component.displayName = "PosterPreview";
  return forwardRef(Component);
}

function getDefaultSettings(business?: Business, program?: Program): PosterSettings {
  const isSubscription = program?.type === "subscription";
  const defaults: PosterSettings = {
    title: isSubscription ? "Оформите подписку и экономьте" : "Получайте награды за каждое посещение",
    description: isSubscription ? "Получайте включённые услуги каждый месяц" : "Сканируйте QR-код и присоединяйтесь к нашей программе лояльности",
    cta: isSubscription ? "Отсканируйте, чтобы посмотреть условия" : "Отсканируйте, чтобы получить карту",
    businessName: business?.name ?? "Wash Club",
    brandColor: business?.brandColor ?? "#6D5DFB",
    theme: "light",
    template: "brand",
    showInstruction: true,
  };
  return applyProgramDesignToPoster(defaults, program?.id);
}

function applyProgramDesignToPoster(defaults: PosterSettings, programId?: string): PosterSettings {
  if (typeof window === "undefined" || !programId) return defaults;
  const saved = window.localStorage.getItem(`memberflow-wallet-design-${programId}`);
  if (!saved) return defaults;
  try {
    const design = JSON.parse(saved) as Partial<{ businessName: string; primaryColor: string; logoDataUrl: string; textTone: string; template: string }>;
    return {
      ...defaults,
      businessName: design.businessName ?? defaults.businessName,
      brandColor: design.primaryColor ?? defaults.brandColor,
      logoDataUrl: design.logoDataUrl ?? defaults.logoDataUrl,
      theme: design.textTone === "light" ? "dark" : defaults.theme,
      template: design.template === "minimal" ? "minimal" : defaults.template,
    };
  } catch {
    return defaults;
  }
}

function readStoredSettings(storageKey: string, defaults: PosterSettings): PosterSettings {
  if (typeof window === "undefined") return defaults;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return defaults;
  try {
    return { ...defaults, ...JSON.parse(saved) as Partial<PosterSettings> };
  } catch {
    return defaults;
  }
}

function getPosterCanvasStyle(settings: PosterSettings): CSSProperties {
  const colors = getPosterColors(settings);
  return {
    width: `${A4_WIDTH}px`,
    height: `${A4_HEIGHT}px`,
    backgroundColor: colors.background,
    color: colors.text,
    "--brand-color": settings.brandColor,
    "--poster-background": colors.background,
  } as CSSProperties;
}

function getPosterColors(settings: PosterSettings) {
  if (settings.template === "brand") {
    return { background: settings.brandColor, text: "#ffffff" };
  }
  if (settings.template === "poster") {
    return {
      background: settings.theme === "dark" ? "#0C0D16" : "#F4F5F9",
      text: settings.theme === "dark" ? "#ffffff" : "#121320",
    };
  }
  return {
    background: settings.theme === "dark" ? "#121320" : "#ffffff",
    text: settings.theme === "dark" ? "#ffffff" : "#121320",
  };
}

async function renderPosterPng(node: HTMLElement, settings: PosterSettings) {
  await waitForExportReady(node);
  const dataUrl = await toPng(node, {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    pixelRatio: 3,
    cacheBust: true,
    style: {
      transform: "none",
      transformOrigin: "top left",
    },
  });
  if (settings.template !== "minimal") {
    await assertCenterPixelIsNotWhite(dataUrl);
  }
  return dataUrl;
}

async function waitForExportReady(node: HTMLElement) {
  await document.fonts.ready;
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  }));
}

async function assertCenterPixelIsNotWhite(dataUrl: string) {
  const image = new window.Image();
  image.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Не удалось проверить экспортированное изображение"));
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.drawImage(image, 0, 0);
  const samplePoints = [
    [0.5, 0.5],
    [0.5, 0.18],
    [0.18, 0.5],
    [0.82, 0.5],
    [0.5, 0.82],
  ];
  const hasColoredSample = samplePoints.some(([x, y]) => {
    const [red, green, blue, alpha] = context.getImageData(Math.floor(image.width * x), Math.floor(image.height * y), 1, 1).data;
    return alpha > 0 && !(red > 245 && green > 245 && blue > 245);
  });
  if (!hasColoredSample) {
    console.warn("Poster export color check did not find a non-white sample point.");
  }
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
