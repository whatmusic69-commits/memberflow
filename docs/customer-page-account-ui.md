# Personal Customer Page UI

## Presentation

- Personal pages use CustomerHeader: business logo/name, home anchor, conditional
  rewards/offers navigation, customer profile disclosure, real logout action.
  “My cards” is explicitly future information, without a fabricated route/action.
- Guest pages retain the existing cover, business introduction and join flow.
- Personal order: greeting, loyalty/rewards, QR, compact Wallet state, offers,
  memberships, existing recorded activity, business details/social links.
- Local preview controls are collapsed and no longer repeat the customer's code.
- PersonalPreviewCard still calls the same prototypeCode(businessId, customerId)
  and uses the existing QR encoder options. The manual code now lives in a
  disclosure with clipboard copy and a manual-copy fallback message.
- No new API, authentication, customer model, scanner operation or storage.

## Shared data

LocalCustomerLoyalty and LocalCustomerHistory read the existing business-scoped
journal through useMembershipJournal. They filter by customer and business IDs.
All current nonarchived programme participations are shown; stamps use the existing
LoyaltyProgress, points show supplied current/target values without new accrual
logic. Available rewards and recorded events come from that same journal.
Membership cards reuse LocalMembershipCards. Their events appear in the shared
activity section rather than a second per-membership history in this view.

Production keeps its current personal DTO unchanged: it supplies one loyalty
state and memberships/offers/Wallet states. Multiple production programmes,
event history, points and a production QR payload cannot be invented; they require
corresponding Symfony data. These additions currently display local journal data
only in the existing development preview.

Wallet actions appear only for ADDED or AVAILABLE with a safe action URL. When
neither provider offers an action, one compact unavailable message replaces the
two inactive provider blocks. No pass issuance or success is simulated.

## Components

Changed: CustomerPageView, CustomerExperience, PersonalPreviewCard and scoped
customer-page.css. Added: CustomerHeader, LocalCustomerLoyalty,
LocalCustomerHistory and EN/LV/RU customerAccountContent.

## Verification

No browser checks, lint, typecheck, unit/E2E or build were run, respecting the
user's standing request. Earlier browser access was denied by OS permissions.
Layout uses scoped responsive rules, but the requested viewports and scenarios
are not verified. The existing development server was not started/restarted.
