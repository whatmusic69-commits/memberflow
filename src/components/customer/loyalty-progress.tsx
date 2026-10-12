import { BadgeCheck, Gift } from "lucide-react";
import type { CustomerLoyaltyState } from "@/features/customer-page/types";
/** Presentation of backend-supplied progress; no accrual or eligibility calculations. */
export function LoyaltyProgress({
  loyalty,
  progressLabel,
}: {
  loyalty: CustomerLoyaltyState;
  progressLabel: string;
}) {
  return (
    <>
      <div className="cp-stamps" aria-hidden="true">
        {Array.from(
          { length: Math.min(Math.max(0, loyalty.target), 12) },
          (_, i) => (
            <span key={i} className={i < loyalty.stamps ? "filled" : ""}>
              {i < loyalty.stamps ? (
                <BadgeCheck size={28} strokeWidth={1.6} />
              ) : i === loyalty.target - 1 ? (
                <Gift size={23} strokeWidth={1.5} />
              ) : (
                <span>{String(i + 1).padStart(2, "0")}</span>
              )}
            </span>
          ),
        )}
      </div>
      <p className="cp-progress">
        {progressLabel
          .replace("{current}", String(loyalty.stamps))
          .replace("{target}", String(loyalty.target))}
      </p>
    </>
  );
}
