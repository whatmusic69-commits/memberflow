"use client";
import { useState } from "react";
import type { Locale } from "@/content";
import { registrationContent } from "@/content/customer-registration";
import { registrationFields } from "./model";
import { readRegistrationPolicy, saveRegistrationPolicy } from "./repository";
export function RegistrationSettings({
  businessId,
  locale,
  enabled,
}: {
  businessId: string;
  locale: Locale;
  enabled: boolean;
}) {
  const c = registrationContent[locale],
    [policy, setPolicy] = useState(() => readRegistrationPolicy(businessId)),
    [message, setMessage] = useState("");
  const labels = {
    en: "Save registration settings",
    lv: "Saglabāt reģistrācijas iestatījumus",
    ru: "Сохранить настройки регистрации",
  };
  function save() {
    try {
      saveRegistrationPolicy(businessId, policy);
      setMessage(labels[locale] + " ✓");
    } catch {
      setMessage(c.error);
    }
  }
  return (
    <section className="cp-editor-section cr-settings">
      <h2>{c.settings}</h2>
      <p>{c.settingsText}</p>
      {!enabled && <p>{c.productionFields}</p>}
      {registrationFields.map((field) => (
        <label className="cp-module-toggle" key={field}>
          <span>{c.fields[field]}</span>
          <input
            type="checkbox"
            checked={policy.fields[field]}
            disabled={!enabled}
            onChange={(e) => {
              setPolicy({
                ...policy,
                fields: { ...policy.fields, [field]: e.target.checked },
              });
              setMessage("");
            }}
          />
        </label>
      ))}
      <label className="cp-module-toggle">
        <span>{c.marketingEmail}</span>
        <input
          type="checkbox"
          checked={policy.marketingEmail}
          disabled={!enabled}
          onChange={(e) =>
            setPolicy({ ...policy, marketingEmail: e.target.checked })
          }
        />
      </label>
      <label className="cp-module-toggle">
        <span>{c.marketingSms}</span>
        <input
          type="checkbox"
          checked={policy.marketingSms}
          disabled={!enabled}
          onChange={(e) =>
            setPolicy({ ...policy, marketingSms: e.target.checked })
          }
        />
      </label>
      <div className="cr-registration-preview">
        <h3>{c.preview}</h3>
        {registrationFields
          .filter((f) => policy.fields[f])
          .map((f) => (
            <label key={f}>
              <span>
                {c.fields[f]} · {c.required}
              </span>
              <input
                disabled
                type={f === "email" ? "email" : f === "phone" ? "tel" : "text"}
              />
            </label>
          ))}
        {policy.marketingEmail && <p>○ {c.marketingEmailConsent}</p>}
        {policy.marketingSms && <p>○ {c.marketingSmsConsent}</p>}
      </div>
      {enabled && (
        <button type="button" className="button" onClick={save}>
          {labels[locale]}
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
