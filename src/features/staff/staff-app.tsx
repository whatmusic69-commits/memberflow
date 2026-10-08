"use client";
import { animateDialogClose } from "@/lib/motion/dialog";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, LogOut, RefreshCw } from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { staffContent } from "@/content/staff";
import { dashboardContent } from "@/content/dashboard";
import { Wordmark } from "@/components/ui/brand";
import { Modal } from "@/components/ui/modal";
import { OnboardingLanguageSwitcher } from "@/features/onboarding/language-switcher";
import { accessFor } from "@/features/access/permissions";
import { RolePreview } from "@/features/access/role-preview";
import { authService } from "@/features/auth/service";
import { CameraScanner } from "./camera-scanner";
import { StaffCustomer } from "./customer-view";
import { staffActionPermissions } from "./actions";
import { getStaffService } from "./service";
import type { StaffAction, StaffContext, StaffCustomerView } from "./types";
export function StaffApp({ initialLocale }: { initialLocale: Locale }) {
  const modalNode = useRef<HTMLDialogElement>(null);
  const query = useSearchParams();
  const router = useRouter();
  const language = query.get("lang");
  const [chosenLocale, setLocale] = useState<Locale | null>(null);
  const locale =
    chosenLocale ?? (language && isLocale(language) ? language : initialLocale);
  const c = staffContent[locale];
  const demo =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DASHBOARD_MODE !== "api";
  const fixture = demo ? query.get("demo") : null;
  const previewWorkspace =
    demo && query.get("previewRole") === "STAFF"
      ? (query.get("workspaceDemo") ?? "new")
      : null;
  const [context, setContext] = useState<StaffContext | null>(null);
  const [customer, setCustomer] = useState<StaffCustomerView | null>(null);
  const [loading, setLoading] = useState(true),
    [contextError, setContextError] = useState(false);
  const [retry, setRetry] = useState(0),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState<"resolve" | "action" | "logout" | null>(
    null,
  );
  const [code, setCode] = useState(""),
    [selected, setSelected] = useState<StaffAction | null>(null);
  const [success, setSuccess] = useState("");
  const lock = useRef(false),
    operation = useRef<AbortController | null>(null);
  const request = useRef<{
    actionId: string;
    customerId: string;
    key: string;
  } | null>(null);
  const service = getStaffService(demo);
  const can = accessFor(
    context?.membership.status === "ACTIVE"
      ? context.membership.permissions
      : [],
  ).can;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `memberflow_locale=${locale}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }, [locale]);
  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!disposed) {
        setLoading(true);
        setContextError(false);
        setCustomer(null);
      }
    });
    const load = async () => {
      if (fixture === "error") throw new Error("fixture");
      let value = await getStaffService(demo).context(controller.signal);
      if (previewWorkspace) {
        const { getDashboardService } =
          await import("@/features/dashboard/service");
        const fixture = ["active", "partial", "manager"].includes(
          previewWorkspace,
        )
          ? (previewWorkspace as "active" | "partial" | "manager")
          : "new";
        const overview = await getDashboardService(
          fixture,
          "STAFF",
        ).getOverview(undefined, controller.signal);
        value = {
          ...value,
          business: {
            id: overview.business.id,
            name: overview.business.name,
            logoUrl: overview.business.logoUrl,
          },
          user: overview.user,
          membership: overview.membership,
        };
      }
      const fixtureCustomer =
        fixture === "customer"
          ? (await import("@/mocks/staff/fixtures")).staffCustomer
          : null;
      if (!disposed) {
        setContext(value);
        setCustomer(fixtureCustomer);
      }
    };
    void load()
      .catch(() => {
        if (!disposed) setContextError(true);
      })
      .finally(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
      controller.abort();
      operation.current?.abort();
    };
  }, [demo, fixture, retry, previewWorkspace]);
  async function resolve(value: string) {
    if (!context || !can("customer.scan") || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setSuccess("");
    operation.current?.abort();
    operation.current = new AbortController();
    const controller = operation.current;
    try {
      const result = await service.resolveCustomer(
        context.business.id,
        value.trim(),
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (result.businessId !== context.business.id)
        throw new Error("business mismatch");
      setCustomer(result);
      setCode("");
    } catch {
      if (!controller.signal.aborted) setError("resolve");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function execute() {
    if (
      !context ||
      !customer ||
      !selected ||
      !can(staffActionPermissions[selected.type]) ||
      lock.current
    )
      return;
    const action = selected;
    if (
      request.current?.actionId !== action.id ||
      request.current.customerId !== customer.id
    )
      request.current = {
        actionId: action.id,
        customerId: customer.id,
        key: crypto.randomUUID(),
      };
    lock.current = true;
    setBusy(true);
    setError(null);
    operation.current?.abort();
    const controller = new AbortController();
    operation.current = controller;
    try {
      const result = await service.execute(
        context.business.id,
        customer.id,
        action.id,
        request.current.key,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (result.customer.businessId !== context.business.id)
        throw new Error("business mismatch");
      setCustomer(result.customer);
      setContext({
        ...context,
        recentActions: [result.event, ...context.recentActions].slice(0, 8),
      });
      setSuccess(c.success[action.type]);
      animateDialogClose(modalNode.current, () => setSelected(null));
      request.current = null;
    } catch {
      if (!controller.signal.aborted) setError("action");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function logout() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await authService.logout();
      router.replace(`/login?lang=${locale}`);
    } catch {
      setError("logout");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const changeLocale = (value: Locale) => {
    setLocale(value);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", value);
    window.history.replaceState(window.history.state, "", url);
  };
  return (
    <div className="mf-staff-app">
      <header className="mf-staff-header">
        <span className="mf-staff-brand">
          <Wordmark />
        </span>
        <div className="mf-staff-header-actions">
          {demo && <RolePreview locale={locale} role="STAFF" staff />}
          <OnboardingLanguageSwitcher locale={locale} onChange={changeLocale} />
        </div>
      </header>
      <main id="main" className="mf-staff-main">
        {loading ? (
          <div className="mf-staff-loading" role="status" aria-busy="true">
            {dashboardContent[locale].loading}
          </div>
        ) : contextError || !context ? (
          <section className="mf-staff-error" role="alert">
            <h1>{c.loadError}</h1>
            <button
              className="button button-primary"
              onClick={() => setRetry((v) => v + 1)}
            >
              <RefreshCw size={17} />
              {c.retry}
            </button>
          </section>
        ) : !can("customer.scan") ? (
          <h1>{c.accessDenied}</h1>
        ) : (
          <>
            <div className="mf-staff-identity">
              <div>
                {context.business.logoUrl && (
                  <Image
                    src={context.business.logoUrl}
                    width={36}
                    height={36}
                    alt=""
                    unoptimized
                  />
                )}
                <strong>{context.business.name}</strong>
              </div>
              <span>
                {context.user.firstName} ·{" "}
                {dashboardContent[locale].roles[context.membership.role]}
              </span>
            </div>
            {error && !selected && (
              <p className="mf-form-error" role="alert">
                {error === "resolve"
                  ? c.resolveError
                  : error === "logout"
                    ? c.logoutError
                    : c.actionError}
              </p>
            )}
            {customer ? (
              <StaffCustomer
                customer={customer}
                locale={locale}
                c={c}
                can={can}
                busy={busy}
                message={success}
                onAction={(action) => {
                  setError(null);
                  setSelected(action);
                }}
                onBack={() => {
                  setCustomer(null);
                  setSuccess("");
                  setError(null);
                  request.current = null;
                }}
              />
            ) : (
              <>
                <h1 className="mf-staff-title">{c.scan}</h1>
                <p className="mf-staff-subtitle">{c.scanHint}</p>
                <CameraScanner
                  key={`${context.business.id}:${fixture}`}
                  c={c}
                  disabled={busy}
                  onCode={(value) => void resolve(value)}
                  initialState={
                    fixture === "denied"
                      ? "denied"
                      : fixture === "unsupported"
                        ? "unsupported"
                        : "idle"
                  }
                />
                <details className="mf-staff-manual">
                  <summary>{c.manual}</summary>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void resolve(code);
                    }}
                  >
                    <label className="mf-form-field">
                      <span>{c.code}</span>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        maxLength={2048}
                        autoComplete="off"
                      />
                    </label>
                    <button className="button" disabled={busy}>
                      {busy ? c.resolving : c.resolve}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </details>
              </>
            )}
            <section className="mf-staff-recent">
              <h2>{c.recent}</h2>
              {context.recentActions.length ? (
                <ol>
                  {context.recentActions.map((item) => (
                    <li key={item.id}>
                      <strong>{item.customerName}</strong>
                      <span>
                        {dashboardContent[locale].eventCopy[item.type]}
                      </span>
                      <time dateTime={item.occurredAt}>
                        {new Intl.DateTimeFormat(locale, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(item.occurredAt))}
                      </time>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{c.noRecent}</p>
              )}
            </section>
            <button
              className="mf-text-link mf-staff-logout"
              disabled={busy}
              onClick={() => void logout()}
            >
              <LogOut size={16} />
              {c.logout}
            </button>
          </>
        )}
      </main>
      {selected && customer && (
        <Modal
          dialogRef={modalNode}
          closeDisabled={busy}
          title={c.confirmations[selected.type]}
          closeLabel={c.close}
          className="mf-staff-confirm"
          onClose={() => {
            if (!busy) {
              setSelected(null);
              setError(null);
            }
          }}
        >
          <p>
            <strong>{customer.name}</strong>
          </p>
          {selected.type === "SUBSCRIPTION_USED" && (
            <p>{customer.membership?.name}</p>
          )}
          {selected.remainingAfter !== undefined && (
            <p>
              {c.remainingAfter.replace("{n}", String(selected.remainingAfter))}
            </p>
          )}
          {demo && <p className="mf-staff-preview-note">{c.previewNotice}</p>}
          {error === "action" && (
            <p role="alert" className="mf-form-error">
              {c.actionError}
            </p>
          )}
          <div className="mf-dialog-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                animateDialogClose(modalNode.current, () => {
                  setSelected(null);
                  setError(null);
                })
              }
            >
              {c.cancel}
            </button>
            <button
              className="button button-primary"
              disabled={busy}
              onClick={() => void execute()}
            >
              {busy ? c.working : c.confirm}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
