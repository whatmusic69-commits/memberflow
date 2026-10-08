"use client";
import { animateDialogClose } from "@/lib/motion/dialog";
import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelTop,
  Megaphone,
  Settings,
  Sparkles,
  Ticket,
  Users,
  Waypoints,
  X,
} from "lucide-react";
import {
  workspaceAccess,
  canVisitSection,
  canVisitWorkspace,
} from "@/features/access/permissions";
import type { Permission } from "@/features/access/types";
import { RolePreview, readPreviewRole } from "@/features/access/role-preview";
import { CreateMenu } from "./create-menu";
import { isLocale, type Locale } from "@/content";
import { workspaceContent } from "@/content/workspace";
import { usageContent } from "@/content/usage";
import { localizedPlan } from "./plan-label";
import { dashboardContent } from "@/content/dashboard";
import { Wordmark } from "@/components/ui/brand";
import { OnboardingLanguageSwitcher } from "@/features/onboarding/language-switcher";
import { authService } from "@/features/auth/service";
import { getDashboardService, type DashboardFixture } from "./service";
import type { DashboardOverview, Section } from "./types";
const icons = {
  billing: Ticket,
  overview: LayoutDashboard,
  campaigns: Megaphone,
  offers: Gift,
  customers: Users,
  "customer-page": PanelTop,
  loyalty: Sparkles,
  memberships: Ticket,
  automations: Waypoints,
  integrations: ArrowUpRight,
  settings: Settings,
  team: Users,
};
const groups: Section[][] = [
  ["overview"],
  ["campaigns", "offers"],
  ["customers", "customer-page", "loyalty", "memberships"],
  ["automations"],
  ["team", "integrations", "settings"],
];
interface WorkspaceState {
  data: DashboardOverview | null;
  locale: Locale;
  loading: boolean;
  error: boolean;
  reload: () => void;
  href: (section?: Section) => string;
  can: (permission: Permission) => boolean;
}
const Context = createContext<WorkspaceState | null>(null);
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("Workspace provider required");
  return value;
}
export function Workspace({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const query = useSearchParams();
  const pathname = usePathname();
  const initialLang = query.get("lang") || initialLocale;
  const [languageChoice, setLanguageChoice] = useState<{
    source: string;
    value: Locale;
  } | null>(null);
  const locale: Locale =
    languageChoice?.source === initialLang
      ? languageChoice.value
      : isLocale(initialLang)
        ? initialLang
        : initialLocale;
  const router = useRouter();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestedContext = useRef<string | null>(null);
  const [businessId, setBusinessId] = useState<string>();
  const [compact, setCompact] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const notification = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const c = dashboardContent[locale];
  const { can } = workspaceAccess(data);
  const demo = query.get("demo");
  const previewRole = readPreviewRole(query.get("previewRole"));
  const fixture: DashboardFixture =
    demo === "active" ||
    demo === "manager" ||
    demo === "staff" ||
    demo === "partial" ||
    demo === "error" ||
    demo === "loading"
      ? demo
      : "new";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `memberflow_locale=${locale}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }, [locale]);
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const contextKey = `${fixture}:${businessId || "current"}:${previewRole || "default"}`;
    const changedContext = requestedContext.current !== contextKey;
    requestedContext.current = contextKey;
    Promise.resolve().then(() => {
      if (!disposed) {
        if (changedContext) setLoading(true);
        setError(false);
      }
    });
    getDashboardService(fixture, previewRole)
      .getOverview(businessId, controller.signal)
      .then((result) => {
        if (!disposed) setData(result);
      })
      .catch(() => {
        if (!disposed) {
          setError(true);
          setData(null);
        }
      })
      .finally(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
      controller.abort();
    };
  }, [fixture, attempt, businessId, previewRole]);
  useEffect(() => {
    const refresh = () => setAttempt((value) => value + 1);
    window.addEventListener("memberflow:campaign-drafts-changed", refresh);
    window.addEventListener("memberflow:workspace-drafts-changed", refresh);
    return () => {
      window.removeEventListener("memberflow:campaign-drafts-changed", refresh);
      window.removeEventListener(
        "memberflow:workspace-drafts-changed",
        refresh,
      );
    };
  }, []);
  useEffect(() => {
    if (
      data &&
      workspaceAccess(data).can("customer.scan") &&
      !workspaceAccess(data).can("overview.read")
    ) {
      router.replace(
        `/staff?lang=${locale}${data.source === "demo" ? "&demo=active" : ""}`,
      );
    }
  }, [data, locale, router]);
  function changeLocale(value: Locale) {
    setLanguageChoice({ source: initialLang, value });
    document.cookie = `memberflow_locale=${value}; Path=/; SameSite=Lax; Max-Age=31536000`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", value);
    window.history.replaceState(window.history.state, "", url);
  }
  function href(section: Section = "overview") {
    const params = new URLSearchParams({ lang: locale });
    if (process.env.NODE_ENV === "development" && demo)
      params.set("demo", demo);
    if (previewRole) params.set("previewRole", previewRole);
    return `/dashboard${section === "overview" ? "" : "/" + section}?${params}`;
  }
  function closeDrawer() {
    animateDialogClose(drawer.current, () => {
      drawer.current?.close();
      document.body.style.overflow = "";
      opener.current?.focus({ preventScroll: true });
    });
  }
  useEffect(
    () => () => {
      document.body.style.overflow = "";
    },
    [],
  );
  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(false);
    try {
      await authService.logout();
      router.replace(`/login?lang=${locale}`);
    } catch {
      setLogoutError(true);
    } finally {
      setLoggingOut(false);
    }
  }
  function renderSidebar(mobile = false) {
    return (
      <div className="mf-sidebar-inner">
        <div className="mf-brand">
          <HomeLink locale={locale} aria-label="MemberFlow">
            <Wordmark />
          </HomeLink>
          {mobile ? (
            <button
              onClick={closeDrawer}
              className="mf-icon-button"
              aria-label={c.close}
            >
              <X size={20} />
            </button>
          ) : (
            <button
              onClick={() => setCompact(!compact)}
              className="mf-icon-button mf-collapse"
              aria-label={compact ? c.expand : c.collapse}
              aria-expanded={!compact}
            >
              {compact ? (
                <ChevronsRight size={17} />
              ) : (
                <ChevronsLeft size={17} />
              )}
            </button>
          )}
        </div>
        <details className="mf-business">
          <summary>
            <span className="mf-business-avatar">
              {data?.business.logoUrl ? (
                <Image
                  src={data.business.logoUrl}
                  alt=""
                  width={31}
                  height={31}
                  unoptimized
                />
              ) : (
                data?.business.name.slice(0, 1) || "M"
              )}
            </span>
            <span className="mf-sidebar-label">
              <strong>{data?.business.name || c.noBusiness}</strong>
              <small>
                {data?.business.planName
                  ? localizedPlan(
                      data.business.planName,
                      workspaceContent[locale],
                    )
                  : c.planPending}
              </small>
            </span>
            <ChevronDown size={15} />
          </summary>
          <div className="mf-popover">
            <p>{c.switchBusiness}</p>
            {data?.businesses.map((b) => (
              <button
                key={b.id}
                aria-pressed={b.id === data.business.id}
                onClick={(event) => {
                  setBusinessId(b.id);
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                }}
              >
                <strong>{b.name}</strong>
                <small>
                  {b.city}
                  {b.id === data.business.id ? " · " + c.selected : ""}
                </small>
              </button>
            ))}
          </div>
        </details>
        <nav aria-label={c.menu} className="mf-nav">
          {groups
            .map((group) =>
              group.filter((section) => canVisitSection(data, section)),
            )
            .map(
              (group, index) =>
                group.length > 0 && (
                  <div className="mf-nav-group" key={index}>
                    {index > 0 && (
                      <p className="mf-sidebar-label">{c.groups[index - 1]}</p>
                    )}
                    {group.map((section) => {
                      const Icon = icons[section];
                      const selected =
                        pathname ===
                        (section === "overview"
                          ? "/dashboard"
                          : "/dashboard/" + section);
                      return (
                        <Link
                          key={section}
                          href={href(section)}
                          title={c.nav[section]}
                          aria-current={selected ? "page" : undefined}
                          onClick={() => {
                            if (mobile) closeDrawer();
                          }}
                        >
                          <Icon size={18} />
                          <span className="mf-sidebar-label">
                            {c.nav[section]}
                          </span>
                          {selected && <i />}
                        </Link>
                      );
                    })}
                  </div>
                ),
            )}
        </nav>
        <details className="mf-user">
          <summary>
            <span className="mf-user-avatar">
              {data?.user.firstName.slice(0, 1) || "·"}
            </span>
            <span className="mf-sidebar-label">
              <strong>{data?.user.firstName || c.noUser}</strong>
              <small>{data ? c.roles[data.membership.role] : c.account}</small>
            </span>
            <ChevronDown size={15} />
          </summary>
          <div className="mf-popover mf-user-popover">
            {can("profile.read") && (
              <Link
                onClick={() => mobile && closeDrawer()}
                href={href("settings") + "&tab=profile"}
              >
                {c.profile}
              </Link>
            )}
            {can("billing.read") && (
              <Link
                onClick={() => mobile && closeDrawer()}
                href={href("billing")}
              >
                {usageContent[locale].title}
              </Link>
            )}
            {can("profile.read") && (
              <Link
                onClick={() => mobile && closeDrawer()}
                href={href("settings") + "&tab=profile"}
              >
                {usageContent[locale].accountSettings}
              </Link>
            )}
            <button onClick={logout} disabled={loggingOut}>
              <LogOut size={15} />
              {c.logout}
            </button>
            {logoutError && <p role="alert">{c.logoutError}</p>}
          </div>
        </details>
      </div>
    );
  }
  const section = pathname.split("/")[2] as Section | undefined;
  const title = c.nav[section || "overview"] || c.nav.overview;
  if (data && can("customer.scan") && !can("overview.read"))
    return (
      <main id="main" className="mf-boot" role="status">
        {c.loading}
      </main>
    );
  return (
    <Context.Provider
      value={{
        data,
        locale,
        loading,
        error,
        reload: () => setAttempt((n) => n + 1),
        href,
        can,
      }}
    >
      <div
        className={`mf-workspace ${compact ? "mf-compact" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            const details = (event.target as HTMLElement).closest("details");
            if (details) {
              details.open = false;
              details.querySelector("summary")?.focus({ preventScroll: true });
            }
          }
        }}
      >
        <aside className="mf-sidebar">{renderSidebar()}</aside>
        <dialog
          ref={drawer}
          className="mf-drawer"
          onCancel={(event) => {
            event.preventDefault();
            closeDrawer();
          }}
          aria-label={c.menu}
          onClose={() => {
            document.body.style.overflow = "";
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDrawer();
          }}
        >
          {renderSidebar(true)}
        </dialog>
        <div className="mf-main">
          <header className="mf-topbar">
            <div>
              <button
                ref={opener}
                className="mf-icon-button mf-mobile-menu"
                aria-label={c.menu}
                onClick={() => {
                  drawer.current?.showModal();
                  document.body.style.overflow = "hidden";
                }}
              >
                <Menu size={21} />
              </button>
              <span>{title}</span>
            </div>
            <div className="mf-top-actions">
              {data?.source === "demo" && (
                <RolePreview locale={locale} role={data.membership.role} />
              )}
              <OnboardingLanguageSwitcher
                locale={locale}
                onChange={changeLocale}
              />
              <button
                className="mf-icon-button"
                aria-label={c.notifications}
                onClick={() => notification.current?.showModal()}
              >
                <Bell size={19} />
              </button>
              <CreateMenu c={c} href={href} can={can} />
            </div>
          </header>
          <main key={pathname} id="main" className="mf-content">
            {data &&
            !canVisitWorkspace(
              data,
              section || "overview",
              query.get("tab"),
            ) ? (
              <section className="mf-load-error">
                <h1>{c.accessDenied}</h1>
                <p>{c.accessDeniedText}</p>
              </section>
            ) : (
              <Fragment key={data?.business.id}>{children}</Fragment>
            )}
          </main>
        </div>
        <dialog
          ref={notification}
          onClick={(event) => {
            if (event.target === event.currentTarget)
              animateDialogClose(notification.current, () =>
                notification.current?.close(),
              );
          }}
          onCancel={(event) => {
            event.preventDefault();
            animateDialogClose(notification.current, () =>
              notification.current?.close(),
            );
          }}
          className="mf-notification"
          aria-labelledby="mf-notification-title"
        >
          <button
            className="mf-icon-button"
            aria-label={c.close}
            onClick={() =>
              animateDialogClose(notification.current, () =>
                notification.current?.close(),
              )
            }
          >
            <X size={20} />
          </button>
          <Bell size={25} />
          <h2 id="mf-notification-title">{c.notifications}</h2>
          <p>{c.noNotifications}</p>
        </dialog>
      </div>
    </Context.Provider>
  );
}
