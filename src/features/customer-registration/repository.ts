import {
  prototypeEnabled,
  executePrototype,
} from "@/features/prototype/repository";
import {
  readPageDraft,
  customerPageDraftEvent,
} from "@/features/customer-page/service";
import {
  readLocalRecords,
  moduleRepository,
  workspaceDraftEvent,
} from "@/features/workspace/repository";
import {
  defaultPolicy,
  registrationFields,
  validProfile,
  type RegistrationPolicy,
  type PreviewCustomerSession,
  type PreviewCustomerAccount,
  type PreviewParticipation,
} from "./model";
const policyKey = (id: string) => `memberflow:customer-registration:v1:${id}`;
const sessionKey = "memberflow:customer-account-preview:v1";
export const customerPreviewEvent =
  "memberflow:customer-preview-session-changed";
export function readRegistrationPolicy(id: string): RegistrationPolicy {
  if (!prototypeEnabled()) return structuredClone(defaultPolicy);
  try {
    const p = JSON.parse(localStorage.getItem(policyKey(id)) || "null");
    if (
      p?.version === 1 &&
      p.fields &&
      registrationFields.every((f) => typeof p.fields[f] === "boolean") &&
      typeof p.marketingEmail === "boolean" &&
      typeof p.marketingSms === "boolean"
    )
      return p;
  } catch {}
  return structuredClone(defaultPolicy);
}
export function saveRegistrationPolicy(id: string, policy: RegistrationPolicy) {
  if (!prototypeEnabled()) throw new Error("unavailable");
  localStorage.setItem(policyKey(id), JSON.stringify(policy));
  window.dispatchEvent(new Event(customerPageDraftEvent));
}
export function readCustomerPreview(includeInactive = false): PreviewCustomerSession | null {
  if (!prototypeEnabled()) return null;
  try {
    const s = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
    if (
      s?.version !== 1 ||
      !s.account ||
      typeof s.account.id !== "string" ||
      !registrationFields.every((f) => typeof s.account[f] === "string") ||
      !Array.isArray(s.participations) ||
      !s.participations.every(
        (p: PreviewParticipation) =>
          p &&
          typeof p.businessId === "string" &&
          typeof p.customerId === "string" &&
          (p.programmeId === null || typeof p.programmeId === "string") &&
          Array.isArray(p.sharedFields) &&
          p.sharedFields.every((f) => registrationFields.includes(f)) &&
          typeof p.marketing?.email === "boolean" &&
          typeof p.marketing?.sms === "boolean" &&
          typeof p.joinedAt === "string" &&
          !Number.isNaN(Date.parse(p.joinedAt)),
      )
    )
      return null;
    if (s.active !== undefined && typeof s.active !== "boolean") return null;
    return !includeInactive && s.active === false ? null : s;
  } catch {
    return null;
  }
}
function writeSession(s: PreviewCustomerSession) {
  sessionStorage.setItem(sessionKey, JSON.stringify(s));
  window.dispatchEvent(new Event(customerPreviewEvent));
}
/** Explicit selection of a fictional identity, never an OTP verification/authentication result. */
export function beginCustomerPreview(email: string) {
  if (!prototypeEnabled() || !/^[^\s@]+@[^\s@]+\.test$/.test(email))
    throw new Error("fictional");
  const existing = readCustomerPreview(true);
  if (existing && existing.account.email === email) {
    const resumed = {...existing, active: true};
    writeSession(resumed);
    return resumed;
  }
  const next: PreviewCustomerSession = {
    version: 1,
    account: { id: crypto.randomUUID(), name: "", email, phone: "" },
    participations: [],
  };
  writeSession(next);
  return next;
}
export function endCustomerPreview() {
  if (!prototypeEnabled()) return;
  const session = readCustomerPreview(true);
  if (session) writeSession({...session, active: false});
}
export function currentParticipation(businessId: string) {
  const link = readCustomerPreview()?.participations.find(
    (p) => p.businessId === businessId,
  );
  return link &&
    readLocalRecords(businessId, "customers").some(
      (c) => c.id === link.customerId && !c.archived,
    )
    ? link
    : null;
}
export async function joinCustomerPreview(
  businessId: string,
  values: Pick<PreviewCustomerAccount, "name" | "email" | "phone">,
  programmeId: string | null,
  share: boolean,
  marketing: { email: boolean; sms: boolean },
) {
  if (!prototypeEnabled()) throw new Error("unavailable");
  const session = readCustomerPreview(),
    policy = readRegistrationPolicy(businessId),
    page = readPageDraft(businessId);
  if (
    !session ||
    page?.status !== "ACTIVE" ||
    !validProfile(values, policy) ||
    (registrationFields.some((f) => policy.fields[f]) && !share)
  )
    throw new Error("invalid");
  const existing = currentParticipation(businessId);
  if (existing) return existing;
  if (session.participations.some((p) => p.businessId === businessId))
    throw new Error("archived");
  if (
    programmeId &&
    !readLocalRecords(businessId, "loyalty").some(
      (p) => p.id === programmeId && !p.archived,
    )
  )
    throw new Error("programme");
  const customerId = `preview-customer-${session.account.id}-${businessId}`;
  const keys = [
    `memberflow:workspace:v1:${businessId}:customers`,
    `memberflow:prototype-journal:v1:${businessId}`,
    sessionKey,
  ];
  const snapshots = keys.map((key) => sessionStorage.getItem(key));
  try {
    await moduleRepository("customers", true).save(
      businessId,
      {
        name: policy.fields.name ? values.name.trim() : "Preview customer",
        email: policy.fields.email ? values.email.trim() : "",
        phone: policy.fields.phone ? values.phone.trim() : "",
        notes: "",
      },
      customerId,
    );
    executePrototype({
        businessId,
        customerId,
        programmeId: programmeId ?? undefined,
        type: programmeId ? "join" : "register",
        key: `registration:${session.account.id}:${businessId}:${programmeId}`,
        actorName: null,
        memberId: "preview-customer",
      });
    const participation: PreviewParticipation = {
      businessId,
      customerId,
      programmeId,
      sharedFields: registrationFields.filter((f) => policy.fields[f]),
      marketing: {
        email: policy.marketingEmail && marketing.email,
        sms: policy.marketingSms && marketing.sms,
      },
      joinedAt: new Date().toISOString(),
    };
    writeSession({
      ...session,
      account: { ...session.account, ...values },
      participations: [...session.participations, participation],
    });
    window.dispatchEvent(new Event(workspaceDraftEvent));
    return participation;
  } catch (error) {
    keys.forEach((key, index) => {
      const value = snapshots[index];
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    });
    window.dispatchEvent(new Event(workspaceDraftEvent));
    throw error;
  }
}
