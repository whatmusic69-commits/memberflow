"use client";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import { ArrowLeft, ArrowRight, Check, Clock3, Eye, EyeOff } from "lucide-react";
import type { Locale } from "@/content";
import type { OnboardingContent } from "@/content/onboarding/types";
import { Wordmark } from "@/components/ui/brand";
import { saveOnboardingPreview } from "@/features/dashboard/onboarding-preview";
import { getDevelopmentPlans } from "@/config/plans";
import type {
  BusinessDraft,
  BusinessType,
  GoalId,
  OwnerDraft,
  PlanSelection,
  ProfileDraft,
} from "./types";
import { authContent } from "@/content/auth";
import { legalContent } from "@/content/legal";
import { onboardingContent } from "@/content/onboarding";
import { OnboardingLanguageSwitcher } from "./language-switcher";
import { CountrySelect } from "./country-select";
import { PlanPicker } from "./plan-picker";
import { BusinessPreview } from "./business-preview";
const goals: GoalId[] = [
  "reach",
  "campaigns",
  "relationships",
  "loyalty",
  "memberships",
  "insights",
  "return",
];
const businessTypes: BusinessType[] = [
  "cafe",
  "beauty",
  "fitness",
  "retail",
  "services",
  "other",
];
export function Onboarding({
  locale: initialLocale,
}: {
  c: OnboardingContent;
  locale: Locale;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const c = onboardingContent[locale];
  const developmentPlans = getDevelopmentPlans(c);
  function changeLanguage(value: Locale) {
    setLocale(value);
    // Translate the current form in place: keep drafts, step and reading position.
    window.history.replaceState(
      window.history.state,
      "",
      `/${value}/onboarding`,
    );
    document.documentElement.lang = value;
    document.cookie = `memberflow_locale=${value}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [boundary, setBoundary] = useState(false);
  const [owner, setOwner] = useState<OwnerDraft>({ firstName: "", email: "" });
  const [business, setBusiness] = useState<BusinessDraft>({
    name: "",
    type: "cafe",
    country: "",
    city: "",
  });
  const [selectedGoals, setGoals] = useState<GoalId[]>([]);
  const [profile, setProfile] = useState<ProfileDraft>({
    accent: "#c84720",
    logoBorder: true,
    description: "",
    website: "",
    instagram: "",
    logo: null,
  });
  const [selection, setSelection] = useState<PlanSelection | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    },
    [logoUrl],
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const validWebsite = !profile.website.trim() || (() => {
    try { new URL(profile.website); return true; } catch { return false; }
  })();
  const completed = [
    Boolean(owner.firstName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email) && password.length >= 8 && termsAccepted && privacyAccepted),
    Boolean(business.name.trim() && business.country && business.city.trim() && (business.type !== "other" || business.otherType?.trim())),
    selectedGoals.length > 0,
    validWebsite,
    Boolean(selection?.planId),
  ];
  const canChoosePlan = completed.slice(0, 4).every(Boolean);
  function move(next: number) {
    if (next === 4 && !canChoosePlan) {
      next = completed.slice(0, 4).findIndex((done) => !done);
    }
    setBoundary(false);
    setPasswordVisible(false);
    setStep(next);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  const input = (
    label: string,
    name: string,
    value: string,
    change: (value: string) => void,
    options: { type?: string; required?: boolean; maxLength?: number; placeholder?: string } = {},
  ) => (
    <label className="onboarding-field" key={name}>
      <span>{label}</span>
      <input
        name={name}
        type={options.type ?? "text"}
        required={options.required}
        placeholder={options.placeholder}
        maxLength={options.maxLength ?? 120}
        value={value}
        onChange={(e) => change(e.target.value)}
      />
    </label>
  );
  return (
    <div className="onboarding-shell">
      <header className="onboarding-header container">
        <HomeLink locale={locale} aria-label="MemberFlow">
          <Wordmark />
        </HomeLink>
        <div className="onboarding-header-actions">
          <OnboardingLanguageSwitcher
            locale={locale}
            onChange={changeLanguage}
          />
        </div>
      </header>
      <main id="main" className="onboarding-main container">
        <p className="onboarding-duration">
          <Clock3 size={15} aria-hidden="true" />
          <span>{c.setupDuration}</span>
        </p>
        <ol
          className="onboarding-progress"
          style={{ "--onboarding-step": step } as CSSProperties}
          aria-label={c.previewLabel}
        >
          {c.steps.map((label, i) => (
            <li
              key={label}
              className={i === step ? "current" : completed[i] ? "complete" : ""}
              aria-current={i === step ? "step" : undefined}
            >
              <button
                type="button"
                className="onboarding-step-button"
                onClick={() => move(i)}
                disabled={i === 4 && !canChoosePlan}
                aria-current={i === step ? "step" : undefined}
                aria-label={`${label}${i < 4 && !completed[i] ? ` — ${c.incompleteStep}` : ""}`}
                title={i === 4 && !canChoosePlan ? c.planLocked : undefined}
              >
                <span className="onboarding-step-number">
                  {completed[i] ? <Check size={13} aria-hidden="true" /> : String(i + 1).padStart(2, "0")}
                </span>
                <strong>{label}</strong>
                {i < 4 && !completed[i] && <span className="onboarding-step-warning" aria-hidden="true">!</span>}
              </button>
            </li>
          ))}
        </ol>
        {!canChoosePlan && <p className="onboarding-plan-lock-note">{c.planLocked}</p>}
        <div className={`onboarding-layout ${step === 4 ? "plan-layout" : ""}`}>
          <div className="onboarding-form-area">
            <p className="eyebrow">
              0{step + 1} — {c.steps[step]}
            </p>
            <h1 ref={heading} tabIndex={-1}>
              {boundary ? c.checkoutTitle : c.headlines[step]}
            </h1>
            <p className="onboarding-support">
              {boundary
                ? process.env.NODE_ENV === "development"
                  ? c.workspacePreviewDescription
                  : c.checkoutDescription
                : c.support[step]}
            </p>
            {boundary ? (
              <div className="billing-boundary">
                <strong>{business.name}</strong>
                <p>
                  {c.steps[4]}{" "}
                  {developmentPlans
                    .find((plan) => plan.id === selection?.planId)
                    ?.name.replace(/^PLAN /, "")}{" "}
                  · {selection?.interval === "yearly" ? c.yearly : c.monthly}
                </p>
                {process.env.NODE_ENV === "development" && (
                  <Link
                    className="button button-primary"
                    href={`/dashboard?lang=${locale}&welcome=1`}
                    onClick={() =>
                      saveOnboardingPreview({
                        firstName: owner.firstName,
                        business: {
                          name: business.name,
                          type: business.type,
                          otherType: business.otherType,
                          city: business.city,
                          country: business.country,
                        },
                        profile: {
                          accent: profile.accent,
                          logoBorder: profile.logoBorder,
                          description: profile.description,
                          website: profile.website,
                          instagram: profile.instagram,
                        },
                        goals: selectedGoals,
                        planName:
                          developmentPlans.find(
                            (plan) => plan.id === selection?.planId,
                          )?.name || null,
                        selection: selection!,
                      })
                    }
                  >
                    {c.openWorkspace}
                    <ArrowRight size={16} />
                  </Link>
                )}
                <button className="button" onClick={() => setBoundary(false)}>
                  {c.editPlan}
                  <ArrowLeft size={16} />
                </button>
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (step === 4) {
                    if (selection?.planId) setBoundary(true);
                    return;
                  }
                  move(step + 1);
                }}
              >
                <div className="onboarding-fields">
                  {step === 0 && (
                    <>
                      {input(
                        c.firstName,
                        "given-name",
                        owner.firstName,
                        (firstName) => setOwner({ ...owner, firstName }),
                        { required: true },
                      )}
                      {input(
                        c.email,
                        "email",
                        owner.email,
                        (email) => setOwner({ ...owner, email }),
                        { type: "email", required: true },
                      )}
                      <div className="onboarding-field">
                        <label htmlFor="onboarding-password">
                          {c.password}
                        </label>
                        <div className="auth-password onboarding-password">
                          <input
                            id="onboarding-password"
                            type={passwordVisible ? "text" : "password"}
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            aria-describedby="onboarding-password-hint"
                            required
                            minLength={8}
                            maxLength={128}
                          />
                          <button
                            type="button"
                            className="auth-password-toggle"
                            aria-label={
                              passwordVisible
                                ? authContent[locale].hide
                                : authContent[locale].show
                            }
                            aria-controls="onboarding-password"
                            aria-pressed={passwordVisible}
                            onClick={() => setPasswordVisible(!passwordVisible)}
                          >
                            {passwordVisible ? (
                              <EyeOff size={18} aria-hidden="true" />
                            ) : (
                              <Eye size={18} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        <small id="onboarding-password-hint">
                          {c.passwordHint}
                        </small>
                      </div>
                      <label className="consent">
                        <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                        <span>
                          {legalContent[locale].accept}{" "}
                          <Link
                            href={`/${locale}/terms`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${legalContent[locale].termsLink} (${legalContent[locale].newTab})`}
                          >
                            {legalContent[locale].termsLink}
                          </Link>
                        </span>
                      </label>
                      <label className="consent">
                        <input type="checkbox" required checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} />
                        <span>
                          {legalContent[locale].accept}{" "}
                          <Link
                            href={`/${locale}/privacy`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${legalContent[locale].privacyLink} (${legalContent[locale].newTab})`}
                          >
                            {legalContent[locale].privacyLink}
                          </Link>
                        </span>
                      </label>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      {input(
                        c.businessName,
                        "business-name",
                        business.name,
                        (name) => setBusiness({ ...business, name }),
                        { required: true },
                      )}
                      <label className="onboarding-field">
                        <span>{c.businessType}</span>
                        <select
                          value={business.type}
                          onChange={(e) =>
                            setBusiness({
                              ...business,
                              type: e.target.value as BusinessType,
                            })
                          }
                        >
                          {businessTypes.map((type, i) => (
                            <option key={type} value={type}>
                              {c.types[i]}
                            </option>
                          ))}
                        </select>
                      </label>
                      {business.type === "other" && (
                        <label className="onboarding-field">
                          <span>{c.otherBusinessType}</span>
                          <input
                            name="business-type-other"
                            type="text"
                            required
                            maxLength={120}
                            pattern={".*\\S.*"}
                            value={business.otherType ?? ""}
                            onChange={(event) =>
                              setBusiness({
                                ...business,
                                otherType: event.target.value,
                              })
                            }
                          />
                        </label>
                      )}
                      <div className="onboarding-two-fields">
                        <CountrySelect
                          locale={locale}
                          label={c.country}
                          placeholder={c.chooseCountry}
                          value={business.country}
                          onChange={(country) =>
                            setBusiness({ ...business, country })
                          }
                        />
                        {input(
                          c.city,
                          "address-level2",
                          business.city,
                          (city) => setBusiness({ ...business, city }),
                          { required: true },
                        )}
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <fieldset className="goal-options">
                      <legend className="sr-only">{c.headlines[2]}</legend>
                      {goals.map((goal, i) => (
                        <label
                          className={
                            selectedGoals.includes(goal) ? "selected" : ""
                          }
                          key={goal}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGoals.includes(goal)}
                            onChange={(e) =>
                              setGoals(
                                e.target.checked
                                  ? [...selectedGoals, goal]
                                  : selectedGoals.filter(
                                      (value) => value !== goal,
                                    ),
                              )
                            }
                          />
                          <span>{c.goals[i]}</span>
                        </label>
                      ))}
                      <p className="onboarding-note">{c.goalHint}</p>
                    </fieldset>
                  )}
                  {step === 3 && (
                    <>
                      <label className="onboarding-field">
                        <span>{c.logo}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (
                              file &&
                              (file.size > 5 * 1024 * 1024 ||
                                ![
                                  "image/png",
                                  "image/jpeg",
                                  "image/webp",
                                ].includes(file.type))
                            ) {
                              e.target.setCustomValidity(c.logoHint);
                              e.target.reportValidity();
                              return;
                            }
                            e.target.setCustomValidity("");
                            setLogoUrl(file ? URL.createObjectURL(file) : null);
                            setProfile({ ...profile, logo: file });
                          }}
                        />
                        <small>{c.logoHint}</small>
                      </label>
                      <label className="consent">
                        <input
                          type="checkbox"
                          checked={profile.logoBorder}
                          onChange={(e) =>
                            setProfile({ ...profile, logoBorder: e.target.checked })
                          }
                        />
                        <span>{c.logoBorder}</span>
                      </label>
                      {input(
                        c.accent,
                        "accent",
                        profile.accent,
                        (accent) => setProfile({ ...profile, accent }),
                        { type: "color" },
                      )}
                      <label className="onboarding-field">
                        <span>{c.description}</span>
                        <textarea
                          maxLength={300}
                          rows={3}
                          placeholder={c.placeholders.description}
                          value={profile.description}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              description: e.target.value,
                            })
                          }
                        />
                      </label>
                      {input(
                        c.website,
                        "website",
                        profile.website,
                        (website) => setProfile({ ...profile, website }),
                        { type: "url", placeholder: c.placeholders.website },
                      )}
                      {input(
                        c.instagram,
                        "instagram",
                        profile.instagram,
                        (instagram) => setProfile({ ...profile, instagram }),
                        { placeholder: c.placeholders.instagram },
                      )}
                    </>
                  )}
                  {step === 4 && (
                    <PlanPicker
                      c={c}
                      plans={developmentPlans}
                      selection={selection}
                      onChange={setSelection}
                    />
                  )}
                </div>
                <div className="onboarding-form-actions">
                  {step > 0 && (
                    <button
                      type="button"
                      className="text-action"
                      onClick={() => move(step - 1)}
                    >
                      <ArrowLeft size={15} />
                      {c.back}
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      type="button"
                      className="text-action"
                      onClick={() => move(4)}
                    >
                      {c.skip}
                    </button>
                  )}
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={
                      (step === 2 && !selectedGoals.length) ||
                      (step === 4 && !selection?.planId)
                    }
                  >
                    {c.continue}
                    <ArrowRight size={16} />
                  </button>
                </div>
                {step === 4 && !selection?.planId && (
                  <p className="onboarding-note">{c.planHint}</p>
                )}
              </form>
            )}
          </div>
          <BusinessPreview
            c={c}
            business={business}
            profile={profile}
            logoUrl={logoUrl}
            businessTypeLabel={step === 4
              ? business.type === "other"
                ? business.otherType?.trim() || c.types[5]
                : c.types[businessTypes.indexOf(business.type)]
              : undefined}
            goals={step === 4 ? selectedGoals.map((goal) => c.goals[goals.indexOf(goal)]) : undefined}
          />
        </div>
        <p className="onboarding-login-link">
          {authContent[locale].already}{" "}
          <Link href={`/login?lang=${locale}`}>
            {authContent[locale].login} →
          </Link>
        </p>
        <p className="onboarding-footnote">{c.previewNotice}</p>
      </main>
    </div>
  );
}
