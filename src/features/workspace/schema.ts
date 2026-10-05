import type { ModuleId } from "./types";
export interface EditorField {
  key: string;
  type?: "email" | "tel" | "number" | "date" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  min?: number;
  step?: string;
}
export const schemas: Record<
  ModuleId,
  { defaults: Record<string, string>; fields: EditorField[] }
> = {
  customers: {
    defaults: { name: "", email: "", phone: "", notes: "" },
    fields: [
      { key: "name", required: true },
      { key: "email", type: "email" },
      { key: "phone", type: "tel" },
      { key: "notes", type: "textarea" },
    ],
  },
  loyalty: {
    defaults: {
      name: "",
      kind: "stamps",
      target: "6",
      reward: "",
      description: "",
    },
    fields: [
      { key: "name", required: true },
      { key: "kind", type: "select", options: ["stamps", "points"] },
      { key: "target", type: "number", required: true, min: 1 },
      { key: "reward", required: true },
      { key: "description", type: "textarea" },
    ],
  },
  memberships: {
    defaults: {
      name: "",
      kind: "membership",
      price: "",
      currency: "EUR",
      visits: "",
      interval: "monthly",
      description: "",
    },
    fields: [
      { key: "name", required: true },
      { key: "kind", type: "select", options: ["membership", "package"] },
      { key: "price", type: "number", required: true, min: 0, step: "0.01" },
      { key: "currency", type: "select", options: ["EUR", "USD", "GBP"] },
      { key: "visits", type: "number", min: 1 },
      { key: "interval", type: "select", options: ["monthly", "yearly"] },
      { key: "description", type: "textarea" },
    ],
  },
  offers: {
    defaults: { name: "", description: "", audience: "all", expiresAt: "" },
    fields: [
      { key: "name", required: true },
      { key: "description", type: "textarea", required: true },
      {
        key: "audience",
        type: "select",
        options: ["all", "returning", "inactive"],
      },
      { key: "expiresAt", type: "date" },
    ],
  },
  automations: {
    defaults: {
      name: "",
      inactivityDays: "30",
      offerId: "",
      channel: "memberflow",
    },
    fields: [
      { key: "name", required: true },
      { key: "inactivityDays", type: "number", required: true, min: 1 },
      { key: "offerId", type: "select", required: true },
      { key: "channel", type: "select", options: ["memberflow", "wallet"] },
    ],
  },
};
