import type { BusinessSummary } from "@/features/dashboard/types";
import type {
  CustomerPageConfig,
  CustomerPagePublic,
  CustomerPagePersonal,
} from "@/features/customer-page/types";
export function emptyPageConfig(business: BusinessSummary): CustomerPageConfig {
  return {
    businessId: business.id,
    slug: "your-coffee",
    publicUrl: null,
    status: "DRAFT",
    branding: {
      logoUrl: business.logoUrl,
      coverUrl: null,
      accent: business.accent || "#c84a27",
    },
    business: {
      name: business.name,
      category: business.category,
      description: business.description || "",
      city: business.city,
      address: "",
      openingHours: "",
      phone: "",
      email: "",
    },
    modules: { offers: true, loyalty: true, memberships: true, social: true },
    social: {
      instagram: business.instagram || "",
      tiktok: "",
      facebook: "",
      website: business.website || "",
    },
    invitation: { headline: "", message: "" },
    wallet: { apple: "NOT_CONFIGURED", google: "NOT_CONFIGURED" },
    content: { offers: [], loyalty: null, memberships: [] },
  };
}
const offer = {
  id: "demo-pumpkin",
  title: "Pumpkin Latte",
  description: "A seasonal coffee, with pumpkin and warm spices.",
  priceLabel: "€3.90",
  bonusLabel: "+2 stamps",
  validUntil: null,
  imageUrl: "/images/latte.jpg",
};
export const guestBusinessPage: CustomerPagePublic = {
  slug: "your-coffee",
  status: "ACTIVE",
  branding: { logoUrl: null, coverUrl: null, accent: "#b54b2d" },
  business: {
    name: "Your Coffee",
    category: "cafe",
    description:
      "Your neighbourhood coffee spot. Good coffee, familiar faces, a reason to pause.",
    city: "Riga",
    address: "",
    openingHours: "",
    phone: "",
    email: "",
  },
  modules: { offers: true, loyalty: true, memberships: true, social: true },
  social: { instagram: "", tiktok: "", facebook: "", website: "" },
  offers: [offer],
  loyalty: { reward: "Free coffee" },
  availableMemberships: [],
  connection: { joinEnabled: false },
};
export const connectedCustomerPage: CustomerPagePersonal = {
  customer: { id: "preview-customer", firstName: "Anna" },
  loyalty: { stamps: 4, target: 6, nextReward: "Free coffee" },
  memberships: [
    {
      id: "preview-club",
      name: "Coffee Club",
      remainingVisits: 8,
      validUntil: null,
      statusLabel: null,
    },
  ],
  offers: [offer],
  wallet: {
    apple: { status: "UNAVAILABLE", actionUrl: null },
    google: { status: "UNAVAILABLE", actionUrl: null },
  },
};
export const businessWithoutLoyalty = { ...guestBusinessPage, loyalty: null };
export const businessWithOffers = guestBusinessPage;
export const businessMinimalProfile: CustomerPagePublic = {
  ...guestBusinessPage,
  business: { ...guestBusinessPage.business, description: "", city: "" },
  offers: [],
  loyalty: null,
  availableMemberships: [],
};
export const publicFixtures = {
  guest: guestBusinessPage,
  offers: businessWithOffers,
  "no-loyalty": businessWithoutLoyalty,
  minimal: businessMinimalProfile,
};
