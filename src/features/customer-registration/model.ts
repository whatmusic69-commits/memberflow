export type RegistrationField = "name" | "email" | "phone";
export interface RegistrationPolicy {
  version: 1;
  fields: Record<RegistrationField, boolean>;
  marketingEmail: boolean;
  marketingSms: boolean;
}
export const defaultPolicy: RegistrationPolicy = {
  version: 1,
  fields: { name: true, email: false, phone: false },
  marketingEmail: false,
  marketingSms: false,
};
export interface PreviewCustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
}
export interface PreviewParticipation {
  businessId: string;
  customerId: string;
  programmeId: string | null;
  sharedFields: RegistrationField[];
  marketing: { email: boolean; sms: boolean };
  joinedAt: string;
}
export interface PreviewCustomerSession {
  active?: boolean;
  version: 1;
  account: PreviewCustomerAccount;
  participations: PreviewParticipation[];
}
export const registrationFields: RegistrationField[] = [
  "name",
  "email",
  "phone",
];
export function missingFields(
  account: PreviewCustomerAccount,
  policy: RegistrationPolicy,
) {
  return registrationFields.filter(
    (field) => policy.fields[field] && !account[field].trim(),
  );
}
export function validProfile(
  values: Pick<PreviewCustomerAccount, RegistrationField>,
  policy: RegistrationPolicy,
) {
  return registrationFields.every(
    (field) =>
      !policy.fields[field] ||
      (field === "email"
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field])
        : field === "phone"
          ? /^\+?[\d ()-]{7,32}$/.test(values[field])
          : !!values[field].trim()),
  );
}
