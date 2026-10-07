import type { CustomerView } from "@/features/workspace/types";
import type { CustomerEventType } from "@/features/dashboard/types";
export type CustomerPeriod = 7 | 30 | 90;
export type CustomerSegment = "all" | "returning" | "inactive";
export interface Money {
  minor: number;
  currency: string;
  fractionDigits?: number;
}
export interface CustomerSummary extends CustomerView {
  joinedAt: string | null;
  lastVisitAt: string | null;
  visitCount: number | null;
  state: "NEW" | "RETURNING" | "INACTIVE" | "UNKNOWN";
  spending: Money | null;
  loyalty: { current: number; target: number; reward: string } | null;
}
export interface CustomerStatistics {
  totalCustomers: number;
  newCustomers: number;
  visits: number;
  returningCustomers: number;
  inactiveCustomers: number;
  netSales: Money | null;
  salesSource: "NOT_CONNECTED" | "AVAILABLE";
  trend: { date: string; visits: number; newCustomers: number }[];
}
export interface CustomerDirectory {
  businessId: string;
  period: CustomerPeriod;
  statistics: CustomerStatistics;
  customers: CustomerSummary[];
  page: number;
  totalResults: number;
  pageSize: number;
}
export interface CustomerDetail {
  businessId: string;
  customer: CustomerSummary;
  memberships: {
    id: string;
    name: string;
    remainingVisits: number | null;
    validUntil: string | null;
    status: "ACTIVE" | "EXPIRED" | "PAUSED";
  }[];
  rewardsEarned: number | null;
  offersRedeemed: number | null;
  events: {
    id: string;
    type: CustomerEventType;
    occurredAt: string;
    detail: string | null;
    actorName: string | null;
  }[];
  purchases: {
    id: string;
    occurredAt: string;
    description: string;
    netAmount: Money;
    status: "PAID" | "REFUNDED" | "PARTIALLY_REFUNDED";
  }[];
  salesSource: "NOT_CONNECTED" | "AVAILABLE";
}
export interface CustomerQuery {
  archived?: boolean;
  period: CustomerPeriod;
  segment: CustomerSegment;
  search: string;
  page: number;
}
