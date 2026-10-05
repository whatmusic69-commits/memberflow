# MemberFlow onboarding: Symfony contract direction

Frontend currently offers an explicit in-memory development preview. It creates no users/businesses/subscriptions and makes no API calls. Passwords stay only in the account form DOM; they are not persisted or retained across steps. No payment details are collected. The production adapter is prepared in `src/features/onboarding/service.ts`, but URLs/DTOs/authentication remain proposals requiring agreement with the backend developer.

## Required sequence and ownership

Owner account → Business → Goals → optional business profile → Plan → backend payment/trial activation → short Ready transition → workspace.

User is a person; Business is an organisation. One User may manage multiple businesses. Backend grants access and authorisation. Creating an account must not automatically imply a paid workspace entitlement.

Loyalty, Wallet, QR identities, social connections, campaigns, customer segments and staff setup belong to activation **after** subscription/trial confirmation, not registration.

## Proposed operations

| Operation | Proposed endpoint | Request | Response |
| --- | --- | --- | --- |
| Register owner | POST /api/v1/auth/register | firstName, email, password, termsAccepted, privacyAccepted; production must include legal document versions | user {id, firstName, email}; session set by Symfony; verification requirements |
| Create business | POST /api/v1/businesses | name, type, country, city; otherType (free text, only when type=other) | business {id, name}; server membership/access |
| Save goals | PUT /api/v1/businesses/{id}/goals | goals: stable goal IDs | 204 or updated goals |
| Optional branding | PATCH /api/v1/businesses/{id} | accent, description, website, instagram; logo upload (multipart or separate upload endpoint to agree) | 204 or profile |
| Plan catalog | GET /api/v1/plans | locale/region context to agree | plans: id, name, description, monthlyPrice, yearlyPrice, currency, features, limits, recommended, trialDays, available; pricing units must be agreed |
| Begin subscription/trial | POST /api/v1/businesses/{id}/subscription | planId, interval; idempotency key | checkoutUrl or confirmed activation; activation.status |
| Hosted checkout alternative | POST /api/v1/billing/checkout | businessId, planId, interval; safe return URL | hosted checkout URL/session reference |
| Authoritative activation | GET /api/v1/billing/subscription?businessId={id} | business ID | status: pending/inactive/active/trialing, businessId, planId |
| Resume onboarding | GET /api/v1/me | authenticated session | user, accessible businesses, current onboarding stage, verification and subscription status |

Errors must use a consistent envelope with field validation errors and retryability. Backend validates all inputs, password/security policy, legal acceptance versions, logo MIME/size, uploaded files, ownership, plan IDs, interval, availability, trial eligibility and subscription status. Country is selected from a local ISO 3166-1 alpha-2 list with flags and EN/LV/RU labels. Requests send the stable two-letter code (e.g. LV), never a translated country name. Enum IDs and DTO versions need agreement.

## Billing requirements

Symfony/billing provider is the source of truth for prices, currency, interval, available plans, limits, taxes, trial eligibility/duration and entitlement. Frontend sends plan ID + interval only, never a trusted price. Development plans (`development-*`) are never valid billing IDs and must be rejected server-side.

The provider hosts payment collection. Symfony creates checkout sessions and handles signed webhooks, idempotency and return/cancel URLs. Frontend never stores card details or implements payment processing, loyalty/subscription calculation or payment verification.

Checkout success URL is **not** proof of payment. On return, frontend obtains backend subscription status. Pending webhooks show a pending screen with retry; cancelled/failed checkout returns to plan selection retaining the authenticated business context. Network errors do not create duplicate subscriptions. Allowlisted checkout destinations and HTTPS must be agreed before redirect integration.

Only server-confirmed `active` or `trialing` renders Ready, then `/dashboard?lang={locale}&welcome=1`. Frontend visibility checks are UX only; Symfony enforces workspace access and authorisation independently.

Recommendations remain disabled until product approves a goals-to-plan mapping. Production may return `recommended` from backend; the user can choose any available plan. No fabricated AI recommendation, discount or trial duration.

## Current frontend integration boundary

`OnboardingService` separates transport from forms. The preview holds drafts in component state only and stops at an explicit billing-unavailable message. `ReadyState` is prepared for confirmed activation and is not exposed as a fake success/demo entitlement. Dashboard Overview now exists; activation must still be verified by Symfony.

Before enabling the adapter: agree DTOs/price units/country IDs, legal documents, verification policy, session cookies/CSRF/CORS, upload endpoint, resume semantics, billing idempotency and provider redirect validation. Set `NEXT_PUBLIC_API_URL` only after these are agreed; setting it alone does not switch the preview into production registration.

## Existing-user login and password recovery

Public frontend routes are `/login?lang=en|lv|ru` and `/forgot-password?lang=en|lv|ru`. Homepage Log in and onboarding Already have an account link to `/login`; Start free goes to business onboarding. Dashboard Overview exists independently; no OAuth providers, Next.js auth endpoints or fake successful login are implemented.

`src/features/auth/service.ts` owns the transport boundary. By default an isolated unavailable adapter returns an explicit localised error. It never authenticates users or claims to send mail. Enable `NEXT_PUBLIC_AUTH_MODE=symfony` only after confirming these contracts alongside `NEXT_PUBLIC_API_URL`. Passwords remain in the current form only, never browser storage or logs.

| Operation | Proposed contract |
| --- | --- |
| POST /api/v1/auth/login | `{ email, password }`; secure session cookie issued by Symfony; 204 or agreed response |
| GET /api/v1/me | `{ user: { id, ... } }`; confirms authenticated session before frontend redirects |
| POST /api/v1/auth/forgot-password | `{ email }`; generic 204/accepted response regardless of account existence |

Agree cookie/session strategy (prefer Secure, HttpOnly cookies), SameSite policy, CSRF requirements, credentialed CORS, login DTO, account verification/expired session semantics and consistent field error shape before enabling the adapter. No JWT storage strategy is assumed. The frontend sends credentials to the API with `credentials: include`; it does not issue or read session cookies.

Authentication errors: generic 401/invalid credentials for wrong password or absent account; 429 for rate limits, with backend-owned retry policy; network/service failures; agreed expired-session reason. Field errors may use `{ errors: { email?: ..., password?: ... } }`; frontend maps known field keys to localised UI messages and does not expose raw backend internals. Recovery responses must not enumerate accounts. Symfony owns throttling, reset token creation/expiry, email delivery and actual password change endpoints (to be agreed separately).

After session confirmation, redirect defaults to `/dashboard`. `redirect` is restricted to same-origin internal workspace paths (`/dashboard/...` or locale-prefixed equivalents), rejecting protocol-relative URLs, other origins, backslashes, controls and unrelated routes. Symfony independently enforces authorisation and subscription access; a client redirect is not an entitlement check. Workspace Overview is implemented below; authorization remains backend-owned.

## DASHBOARD / OVERVIEW

Implemented frontend routes: `/dashboard`, and section shells for campaigns, offers,
customers, loyalty, memberships, automations, integrations, settings. These shells
are not functional feature workflows. Onboarding's verified Ready transition links
to `/dashboard?lang={locale}&welcome=1`; login already accepts safe internal dashboard
redirects. No registration, entitlement, payment or session success is simulated.

### Aggregated screen contract (proposal)

- `GET /api/v1/dashboard`: resolve the current user's selected/default accessible
  business and return its overview. Business selection belongs to the backend session
  or agreed context mechanism, not a query parameter used as authorization.
- `GET /api/v1/businesses/{businessId}/dashboard`: same screen DTO for an accessible
  business. Backend verifies membership, role, permissions and subscription/trial.
- `POST /api/v1/auth/logout`: terminate the secure session; frontend redirects to login
  only after success. Agree CSRF transport with the backend before enabling writes.

`src/features/dashboard/types.ts` documents the screen DTO:

- `business`: ID, display name, category/custom category, city, optional logo URL and
  brand accent, plan display name and previously saved onboarding goal IDs.
- `businesses`: accessible business summaries for the switcher. A User can manage
  multiple businesses. Do not return businesses the user is not authorized to access.
- `user`: stable ID, first name and business role (`OWNER`, `ADMIN`, `MANAGER`, `STAFF`).
- `permissions`: UI capability flags (`canCreate`, `canManageBusiness`). These are
  presentation hints; every protected backend operation still needs authorization.
- `state`: new/active workspace classification; `setup`: backend-confirmed business,
  campaign, customer connection and retention readiness. No invented completion %.
- `flow`: explicit reporting month (`YYYY-MM`) and reach/connect/retain/return counts.
  Define metric semantics and attribution with backend. `null` means unavailable,
  **not** zero. No inferred growth, revenue or percentages.
- `campaigns`: ID, name, start date, aggregate status (`DRAFT`, `PROCESSING`,
  `PUBLISHED`, `PARTIALLY_PUBLISHED`, `FAILED`, `PAUSED`) and per-channel statuses.
  Publication is asynchronous Symfony/Messenger work; rendering must not block.
- `customerActivity`: recent stable event IDs, customer display name, kind
  (joined/visit/reward/membership/redemption), ISO timestamp and optional offer detail.
  Feed is a screen projection of customer events, not a frontend domain model.
- `attention`: explicit backend states, customer IDs/names and concrete days/stamps
  remaining. The frontend must not infer behavioural conclusions from absent data.
- `retention`: active loyalty/membership/offer counts, nullable when unavailable.
- `connection`: QR, customer profile, Apple Wallet and Google Wallet readiness.
  Pass generation, signing and QR identities remain backend responsibilities.
- `integrations`: channel labels and connection/processing/error statuses only.
  Never expose secrets or access tokens in this payload.
- `source: api`: live backend DTOs. `source: demo` is reserved for isolated fixtures.

The adapter performs one aggregate request rather than independent requests in each
widget. Fetch uses secure-session credentials, no-store and AbortSignal. Final URLs,
DTO versioning, CSRF and error conventions require backend agreement. Session expiry
and business-access denial should return agreed 401/403 states; the shell remains
usable, and no mock data is substituted for a failed production request.

### Development fixtures and states

In `next dev`, `/dashboard` uses the isolated **new business** fixture by default.
`?demo=active`, `?demo=error`, `?demo=loading` select alternate UI states. This mechanism
is development-only and has no production switcher. All fixture output is labelled
as a sample workspace. It does not represent a registered user, paid plan or results.
`NEXT_PUBLIC_DASHBOARD_MODE=api` selects the Symfony adapter in development.
Production always uses the real adapter and shows an error when the API is absent.

Onboarding is currently UI-only and cannot transfer a fictional activated business
into a live dashboard. Once backend onboarding is connected, fetch its business,
goals, branding and plan from this endpoint; do not re-request setup fields or store
critical business state in browser storage. Setup actions are ordered from goal IDs;
return actions require customer history. These rules choose UI suggestions only,
not entitlement, loyalty calculations or automation decisions.

`welcome=1` controls a dismissible welcome message and is consumed on first mount.
It is never proof of payment. Billing must verify activation before emitting it.
Workspace authorization, subscription state and first-visit persistence belong to
Symfony. Feature setup begins after activation, outside registration.

### Temporary onboarding → workspace preview

In development only, the selected-plan screen now offers “Open MemberFlow”. It opens
`/dashboard?lang={locale}&welcome=1`, without subscription activation. A tab-scoped
sessionStorage UI draft carries first name, business name/type/city, goal IDs and
placeholder plan selection into the new-business fixture. No password, email, auth
tokens, payment information or entitlement is stored. Storage failure falls back to
the default empty fixture. The production/API adapter ignores this draft entirely;
confirmed backend activation remains mandatory for real workspace access.

## CAMPAIGNS frontend workspace

`/dashboard/campaigns` now has a list, search, draft filter, accessible editor dialog,
photo preview, destination selection and draft editing. The development adapter
stores drafts per preview business ID in sessionStorage and updates Overview. These
are tab-local UI drafts, not published campaigns. They contain no credentials.
Production never uses this adapter; saving is disabled until write contracts and
CSRF transport are agreed. No social connection/publication is simulated.

Proposed `GET /api/v1/businesses/{businessId}/campaigns` supplies list/editor DTOs:
ID, display name, campaign kind (offer/product/service/event/announcement), details,
optional amount/currency, selected destination IDs, image URL, updated timestamp and
publication status. The current editor DTO uses a price string to preserve input
precision; agree the currency/minor-unit representation and media DTO with Symfony.

Future operations to agree: POST draft, PATCH draft, media upload, publication request
and asynchronous per-channel status updates. Backend validates business access,
allowed channels, plan availability, media constraints and all publishing rules.
Do not interpret destination checkboxes as connected OAuth accounts. Production
media upload/storage and publishing remain backend responsibilities.

Other workspace sections now have localized, section-specific content: connection
states, retention empty states, channel directory, read-only account/business data,
goals and plan context. They are not completed feature workflows. Customer page
shows actual DTO activity when present, without deriving fake customer records.

## CUSTOMER / RETENTION / ENGAGEMENT WORKSPACE SCREENS

The remaining navigation routes now have usable frontend screens instead of shells:

- Customers: manual contact editor, search, archive/restore, profile preview and the
  API-provided activity feed. Preview contacts are not inferred from events and do
  not create visits, loyalty balances or membership transactions.
- Loyalty: stamps/points configuration drafts with threshold and reward display.
  The frontend never calculates eligibility, stamps, points or reward issuance.
- Memberships: membership/prepaid-package drafts, price/currency, period and optional
  included visits. No subscription, renewal, deduction or usage calculation occurs.
- Offers: description, intended audience and optional expiry configuration.
  The frontend does not evaluate customer segments or redeem offers.
- Automations: inactive-days trigger configuration, a reference to a saved offer and
  delivery surface. All preview journeys remain not running. No scheduler, queue,
  publishing, notification delivery or reactivation logic exists in Next.js.
- Integrations: original local brand assets, explicit connection states and detail
  dialogs. No OAuth success, QR identity or signed Wallet pass is simulated.
- Settings: business/profile forms, country names/flags, brand color/logo preview,
  onboarding goals and plan context. Billing is read-only pending real activation.

### Screen repositories and contracts (direction, not final entity design)

`src/features/workspace/types.ts` describes the narrow screen drafts. The shared
repository reads `GET /api/v1/businesses/{id}/{customers|loyalty|memberships|offers|automations}`
with the secure session. These paths and collection envelopes need Symfony agreement.
Development uses business-scoped sessionStorage drafts, including archive state,
UUID and update timestamp. Production never reads or writes this storage adapter.
Write buttons are disabled until integration; no production mutation endpoints are
invented. Final create/PATCH/archive APIs must validate permissions and business ID.

Required frontend fields:

- common: ID, display name, update timestamp and archive state;
- customer: email, phone and notes; future visit history, loyalty progress,
  membership assignments and events should be separate backend-provided projections;
- loyalty draft: kind, threshold, reward description, optional program description;
- membership draft: kind, amount/currency, optional included visits, billing interval
  and description. Current form values are strings; agree money/unit DTOs with backend;
- offer draft: description, intended audience ID, optional expiry date;
- automation draft: inactivity period, offer ID and delivery channel. Backend owns
  availability, trigger evaluation, lifecycle, activation and delivery status;
- business settings: name, category/custom category, city/country, description,
  website/Instagram, accent and logo URL; account profile first name stays a distinct
  User field. Production image upload/storage belongs to the backend/media service.

Subscription state, dates and plan availability must come from billing. The preview
shows a placeholder selection and an explicitly unactivated subscription, not a paid
plan. The frontend never treats saved configuration as an active program or raises
retention counters for drafts. Saved business/profile demo changes update the shell
and Overview; a UI refresh does not claim a production account mutation.

### Logo presentation preference
Business profile PATCH should accept `logoBorder` (boolean), independently of the optional brand accent colour. Return this preference with the business profile so customer previews can show or omit the logo border. The default frontend draft uses a border; disabling it does not remove the brand colour. Final persistence and field naming belong to Symfony.

### Provisional owner-provided plan catalog
The onboarding preview now presents Starter (from EUR 25/month, up to 300 active customers), Growth (from EUR 79/month, up to 1,500 active customers), and Business (custom pricing). Names, features and prices are presentation configuration supplied by the owner; annual prices are EUR 210 for Starter and EUR 663.60 for Growth (owner-approved 30% discount versus twelve monthly payments); Business remains custom and trial duration remains undefined. Production GET plans must supply authoritative pricing, intervals, availability and limits. Selecting a plan does not activate access or execute its advertised features.
