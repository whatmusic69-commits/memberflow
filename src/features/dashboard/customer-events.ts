import {
  Gift,
  QrCode,
  RefreshCw,
  Stamp,
  Ticket,
  UserPlus,
  Footprints,
  Tag,
} from "lucide-react";
import type { CustomerActivityItem, CustomerEventType } from "./types";
import type { DashboardContent } from "@/content/dashboard";
const legacy = {
  joined: "CUSTOMER_JOINED",
  visit: "VISIT_CREATED",
  reward: "REWARD_EARNED",
  membership: "SUBSCRIPTION_USED",
  redemption: "OFFER_REDEEMED",
} satisfies Record<string, CustomerEventType>;
const icons = {
  CUSTOMER_JOINED: UserPlus,
  QR_SCANNED: QrCode,
  VISIT_CREATED: Footprints,
  STAMP_ADDED: Stamp,
  REWARD_EARNED: Gift,
  REWARD_REDEEMED: Gift,
  SUBSCRIPTION_USED: Ticket,
  OFFER_REDEEMED: Tag,
  CUSTOMER_RETURNED: RefreshCw,
};
export function customerEventPresentation(
  item: CustomerActivityItem,
  c: DashboardContent,
) {
  const type: CustomerEventType =
    item.kind in legacy
      ? legacy[item.kind as keyof typeof legacy]
      : (item.kind as CustomerEventType);
  return {
    Icon: icons[type] ?? UserPlus,
    copy: c.eventCopy[type] ?? c.activityHeading,
  };
}
