"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { moduleContent } from "@/content/modules";
import { workspaceContent } from "@/content/workspace";
import { dashboardContent } from "@/content/dashboard";
import { onboardingContent } from "@/content/onboarding";
import countries from "@/config/countries.json";
import { useWorkspace } from "@/features/dashboard/workspace";
import { OverviewSkeleton } from "@/features/dashboard/overview";
import { UsagePage } from "@/features/usage/usage-page";
import type { BusinessSettingsDraft } from "./types";
import {
  isDemoAdapter,
  readLocalSettings,
  saveLocalSettings,
} from "./repository";
export function SettingsPage() {
  const { data, locale, loading, error, reload } = useWorkspace();
  const d = dashboardContent[locale];
  if (loading) return <OverviewSkeleton />;
  if (error || !data)
    return (
      <section className="mf-load-error">
        <h1>{d.error}</h1>
        <button className="button" onClick={reload}>
          {d.retry}
        </button>
      </section>
    );
  return <SettingsForm key={data.business.id} />;
}
function SettingsForm() {
  const { data, locale, can, href } = useWorkspace();
  const c = moduleContent[locale];
  const d = dashboardContent[locale];
  const w = workspaceContent[locale];
  const query = useSearchParams();
  const tab =
    query.get("tab") === "profile"
      ? "profile"
      : query.get("tab") === "billing"
        ? "billing"
        : "business";
  const business = data!.business;
  const initial: BusinessSettingsDraft = {
    name: business.name,
    category: business.category,
    city: business.city,
    country: business.country || "",
    description: business.description || "",
    website: business.website || "",
    instagram: business.instagram || "",
    accent: business.accent,
    logoUrl: business.logoUrl,
    firstName: data!.user.firstName,
  };
  const [values, setValues] = useState<BusinessSettingsDraft>(
    () => readLocalSettings(business.id) || initial,
  );
  const [otherCategory, setOtherCategory] = useState(
    () =>
      !Object.keys(d.category).includes(values.category) ||
      values.category === "other",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const demo = isDemoAdapter(data!.source === "demo");
  const allowed =
    demo && (tab === "profile" || can("business.settings.manage"));
  function update<K extends keyof BusinessSettingsDraft>(
    key: K,
    value: BusinessSettingsDraft[K],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !allowed) return;
    if (!values.name.trim() || !values.firstName.trim()) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await saveLocalSettings(
        business.id,
        {
          ...values,
          name: values.name.trim(),
          firstName: values.firstName.trim(),
        },
        demo,
      );
      setMessage(c.saved);
    } catch {
      setFailed(true);
      setMessage(c.saveError);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const field = (
    key:
      "name" | "city" | "description" | "website" | "instagram" | "firstName",
    label: string,
    type = "text",
    required = false,
  ) => (
    <label className="mf-form-field">
      <span>{label}</span>
      {key === "description" ? (
        <textarea
          rows={4}
          maxLength={1000}
          value={values[key]}
          onChange={(e) => update(key, e.target.value)}
        />
      ) : (
        <input
          name={key}
          type={type}
          required={required}
          maxLength={240}
          autoComplete={
            key === "firstName"
              ? "given-name"
              : key === "website"
                ? "url"
                : undefined
          }
          value={values[key]}
          onChange={(e) => update(key, e.target.value)}
        />
      )}
    </label>
  );
  return (
    <section className="mf-feature-page">
      <header className="mf-feature-heading">
        <div>
          <p className="mf-kicker">
            {business.name} / {d.nav.settings}
          </p>
          <h1>{c.settingsTabs[tab]}</h1>
          <p>{w.titles.settings}</p>
        </div>
      </header>
      <nav className="mf-settings-tabs" aria-label={d.nav.settings}>
        {(["business", "profile", "billing"] as const)
          .filter((value) =>
            can(
              value === "business"
                ? "business.settings.read"
                : value === "profile"
                  ? "profile.read"
                  : "billing.read",
            ),
          )
          .map((value) => (
            <Link
              aria-current={tab === value ? "page" : undefined}
              key={value}
              href={href("settings") + "&tab=" + value}
            >
              {c.settingsTabs[value]}
            </Link>
          ))}
      </nav>
      {tab === "billing" ? (
        <UsagePage />
      ) : (
        <div className="mf-settings-editor">
          <form className="mf-panel" onSubmit={save}>
            {tab === "profile" ? (
              <>
                {field("firstName", c.firstName, "text", true)}
                <dl className="mf-details-list">
                  <dt>{c.role}</dt>
                  <dd>{d.roles[data!.membership.role]}</dd>
                </dl>
              </>
            ) : (
              <>
                {field("name", c.businessName, "text", true)}
                <label className="mf-form-field">
                  <span>{c.category}</span>
                  <select
                    value={otherCategory ? "other" : values.category}
                    onChange={(e) => {
                      setOtherCategory(e.target.value === "other");
                      update("category", e.target.value);
                    }}
                  >
                    {Object.entries(d.category).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                {otherCategory && (
                  <label className="mf-form-field">
                    <span>{c.category}</span>
                    <input
                      required
                      maxLength={120}
                      value={values.category === "other" ? "" : values.category}
                      onChange={(e) => update("category", e.target.value)}
                    />
                  </label>
                )}
                <div className="mf-settings-location">
                  <label className="mf-form-field">
                    <span>{c.country}</span>
                    <select
                      autoComplete="country"
                      value={values.country}
                      onChange={(e) => update("country", e.target.value)}
                    >
                      <option value="">{c.choose}</option>
                      {countries[locale].map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} {country.flag}
                        </option>
                      ))}
                    </select>
                  </label>
                  {field("city", c.city)}
                </div>
                {field("description", c.description)}
                {field("website", c.website, "url")}
                {field("instagram", c.instagram)}
                <label className="mf-form-field mf-color-field">
                  <span>{c.accent}</span>
                  <div>
                    <input
                      type="color"
                      value={values.accent}
                      onChange={(e) => update("accent", e.target.value)}
                    />
                    <code>{values.accent}</code>
                  </div>
                </label>
                <label className="mf-form-field">
                  <span>{c.logo}</span>
                  <input
                    ref={logoInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (event) => {
                      const file = event.currentTarget.files?.[0];
                      if (!file) return;
                      setFailed(false);
                      setMessage("");
                      if (
                        !["image/jpeg", "image/png", "image/webp"].includes(
                          file.type,
                        ) ||
                        file.size > 2 * 1024 * 1024
                      ) {
                        setFailed(true);
                        setMessage(c.imageError);
                        event.currentTarget.value = "";
                        return;
                      }
                      setReadingImage(true);
                      try {
                        const result = await new Promise<string>(
                          (resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () =>
                              resolve(String(reader.result));
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                          },
                        );
                        update("logoUrl", result);
                      } catch {
                        setFailed(true);
                        setMessage(c.imageError);
                      } finally {
                        setReadingImage(false);
                      }
                    }}
                  />
                  <small>{c.logoHint}</small>
                </label>
                {values.logoUrl && (
                  <button
                    type="button"
                    className="mf-text-link"
                    onClick={() => {
                      update("logoUrl", null);
                      if (logoInput.current) logoInput.current.value = "";
                    }}
                  >
                    {c.removeLogo}
                  </button>
                )}
              </>
            )}
            <p className="mf-draft-notice">
              {demo ? c.demoNotice : c.apiNotice}
            </p>
            <p
              role={failed ? "alert" : "status"}
              className={failed ? "mf-form-error" : "mf-save-status"}
            >
              {message}
            </p>
            <button
              className="button button-primary"
              type="submit"
              disabled={busy || readingImage || !allowed}
            >
              {busy ? c.saving : c.saveSettings}
              <ArrowRight size={15} />
            </button>
          </form>
          <aside>
            <section className="mf-record-preview mf-business-preview">
              <span className="mf-kicker">{c.preview}</span>
              {values.logoUrl ? (
                <Image
                  src={values.logoUrl}
                  width={64}
                  height={64}
                  alt=""
                  unoptimized
                />
              ) : (
                <span
                  className="mf-business-preview-avatar"
                  style={{ background: values.accent }}
                >
                  {values.name.slice(0, 1)}
                </span>
              )}
              <h3>{tab === "profile" ? values.firstName : values.name}</h3>
              <p>{values.city}</p>
              <small>{values.description}</small>
              <div className="mf-preview-channels">
                <span>{d.nav.loyalty}</span>
                <span>{d.nav.memberships}</span>
                <span>{d.nav.offers}</span>
              </div>
            </section>
            <section className="mf-panel">
              <h2>{c.goals}</h2>
              <ul className="mf-goal-list">
                {business.goals.map((goal) => (
                  <li key={goal}>
                    <Check size={13} />
                    {
                      onboardingContent[locale].goals[
                        (
                          [
                            "reach",
                            "campaigns",
                            "relationships",
                            "loyalty",
                            "memberships",
                            "insights",
                            "return",
                          ] as const
                        ).indexOf(goal)
                      ]
                    }
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </section>
  );
}
