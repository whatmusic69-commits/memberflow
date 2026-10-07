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

Implemented frontend routes: `/dashboard`, campaigns, offers, customers, loyalty,
memberships, automations, integrations and settings. Feature screens provide isolated
frontend drafts; publication, execution, accrual and production writes remain backend-owned. Onboarding's verified Ready transition links
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
- `state`: new/partial/active workspace classification; `setup`: backend-confirmed business,
  campaign, customer connection and retention readiness. No invented completion %.
- `flow`: explicit reporting month (`YYYY-MM`) and reach/connect/retain/return counts.
  Define metric semantics and attribution with backend. `null` means unavailable,
  **not** zero. No inferred growth, revenue or percentages.
- `campaigns`: ID, name, start date, aggregate status (`DRAFT`, `PROCESSING`,
  `PUBLISHED`, `PARTIALLY_PUBLISHED`, `FAILED`, `PAUSED`) and per-channel statuses.
  Publication is asynchronous Symfony/Messenger work; rendering must not block.
- `customerActivity`: recent stable event IDs, customer display name, kind
  (`CUSTOMER_JOINED`, `QR_SCANNED`, `VISIT_CREATED`, `STAMP_ADDED`, `REWARD_EARNED`,
  `REWARD_REDEEMED`, `SUBSCRIPTION_USED`, `OFFER_REDEEMED`, `CUSTOMER_RETURNED`),
  ISO timestamp and optional event detail. Legacy event kinds remain display-compatible.
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

### Lifecycle and next action projection

Overview uses one reusable `MemberFlowFlow` for setup and operational reporting:
**reach → connect → retain → return**. Business is the container, not a lifecycle stage.

New aggregate fields in `DashboardOverview`:

- `lifecycle`: `mode: setup | active`, `period: 7 | 30 | 90` (days), and `stages` keyed
  by reach/connect/retain/return. Each stage supplies `state: completed | current |
  notConfigured | waiting` and a numeric `value` or null. Metric attribution and
  reporting windows must be defined by Symfony. Production metrics are never derived
  from customer rows or activity-feed counts. The old monthly `flow` DTO remains a
  compatibility input while the contract is agreed.
- `nextAction`: nullable screen recommendation with `kind: setup | createCampaign |
  returnOffer | reviewCampaign`, target section, optional campaign ID, and optional
  localized title/description. Null explicitly means no recommendation. Backend
  recommendations take precedence; local fallback rules select UI navigation only.
  Inactive return offers require history/active-business context and an explicit
  inactive attention state. They never schedule or publish anything.
- `setupSummary`: completed/total configuration steps, displayed as text, without a
  percentage. Hidden in active mode. Readiness must reflect backend-confirmed setup,
  not preview drafts or assumed publication success.

Customer connection, retention and channels are displayed as aggregate summaries.
Detailed QR/profile/Wallet states stay on Customers/Integrations; full channel details
stay on Integrations. Attention appears only for backend-supplied actionable items.
The activity feed uses a shared typed event→icon→localized-copy mapping; frontend
never generates visits, stamps, rewards, reactivations or subscription usage.

Existing legacy screen fields remain compatible. The development adapter enriches
its explicit new/partial/active fixtures with lifecycle/next-action/setup projections.
Local campaign drafts can move the empty preview to partial, but cannot activate
channels, subscriptions, retention tools, business access or operational metrics.

### Development fixtures and states

In `next dev`, `/dashboard` uses the isolated **new business** fixture by default.
`?demo=partial`, `?demo=active`, `?demo=error`, `?demo=loading` select alternate UI states. This mechanism
is development-only and has no production switcher. Fixture selection is a development mechanism, without an indicator in normal product UI.
Fixtures do not represent a registered user, paid plan or results; the default new-business
fixture contains no customers, events, performance metrics or active campaigns.
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

## Business customer QR and printable A4 sign

This is now part of Customer Page, whose configuration/public URL is the shared
source for the QR screen and printable sign. The earlier separate QR GET proposal
below is a legacy direction; new frontend code reads the Customer Page config.

The owner-facing page is `/dashboard/customers/connection`, reached from Customers
and the QR entry in Integrations. This is the business acquisition/connection QR,
not a customer's personal staff-scanning identifier.

Proposed GET `/api/v1/businesses/{businessId}/customer-connection` returns
`{ businessId, publicId, publicUrl, status }`; status is READY, NOT_CONFIGURED or
DISABLED. Symfony owns the stable public identifier and URL, business ownership,
availability and any activation flow. The link must stay stable after printing;
editing display names must not invalidate printed codes. QR payload uses this
authoritative URL, never a new random ID on page load.

The frontend encodes the provided URL into a QR with a four-module quiet zone and
renders an A4 portrait sign, business name/logo/city and optional invitation copy.
SVG export and browser Print/Save PDF do not activate customer registration.
Draft invitation text and visibility options are local print preferences; future
persistence requires a separate agreed profile/presentation endpoint.

Public customer landing needs GET `/api/v1/public/businesses/{publicId}` with a
minimal approved public projection, initially name and city. Customer enrollment,
consent, business-customer linkage, authentication, customer identity and Wallet
delivery remain Symfony capabilities. Registration buttons must not claim success
until that contract is integrated. Backend should define locale-aware registration
operations and validation independently of owner-account onboarding.

In development the sign is explicitly a sample; its business-scoped local QR opens
a public presentation preview and never creates a customer. Availability is explained
in the editor; the owner requested that sample notices be omitted from the A4 sign.
Production never falls back to this sample URL. Inactive connections show an honest
unavailable state and disable QR print/export until an authoritative READY URL exists.

## CUSTOMER PAGE

Creating a Business should provision its Customer Page configuration and assign its
public slug automatically in Symfony. New businesses start with an honest draft
and no invented active offers/customer balances; the frontend does not create a
replacement page identity or issue a separate business-domain command on its own.

Public route: `/b/{businessSlug}`. Editor: `/dashboard/customer-page`. The template
is fixed: branding/business identity, join, eligible relationship modules, contact
and social information. No page builder or manually duplicated offers/programs.
Business public slug, uniqueness, canonical domain and stable publicUrl are owned
by Symfony. Frontend never creates production slugs; `/join/{alias}` currently
redirects to `/b/{alias}` and existing printed aliases need backend-approved mapping.

### Public projection

GET `/api/v1/public/business-pages/{slug}` needs only approved public data:

- slug, page status (DRAFT / ACTIVE / DISABLED);
- branding: logo URL, cover URL, six-digit accent colour;
- business name/category, description, city/address, opening-hours display text,
  optional phone/email;
- enabled modules: offers, loyalty, memberships, social;
- configured Instagram/TikTok/Facebook/website links;
- active public offers: ID, title, description, image URL, formatted price/bonus,
  optional validity end date;
- public active loyalty teaser/reward and available membership descriptions;
- customer connection configuration such as whether joining is enabled.

Return 404 for unknown slugs and an explicit unavailable state for disabled/private
draft pages. Filter expired/draft/disabled offers and inactive programs in Symfony.
Frontend does not calculate expiry, eligibility, personalized recommendations,
loyalty or subscription state. Business content stays in its primary language;
only MemberFlow system labels are translated by the frontend.

### Customer session — independent of business User auth

Conceptual operations under `/api/v1/customer/businesses/{slug}`:

- GET `/session`: authenticated customer ID/first name, loyalty stamps/target/next
  reward, memberships with remaining visits/status/validity, eligible offers,
  Apple/Google Wallet state (AVAILABLE / ADDED / UNAVAILABLE) and action URLs.
  Return 401 for an unidentified guest. No global business User membership here.
- POST `/join` `{ phone }`: start OTP challenge, return challengeId. Symfony owns
  delivery, consent, rate limits, expiry, customer creation and business linkage.
- POST `/verify` `{ challengeId, code }`: verify OTP and establish the customer
  session; return updated private projection.
- POST `/logout`: invalidate only the customer session.

These are frontend contract proposals, not final authentication decisions. Agree
cookie names/scopes, SameSite/CORS/CSRF, OTP policy and consent with Symfony before
live integration. No OTP, customer token or auth credential goes into browser
storage. Billing/purchases and Wallet pass generation are not frontend mutations.
Wallet action URLs must be validated, business/customer scoped, and expire where
appropriate. Browser customer access remains available without Wallet or an app.

### Privacy and caching boundary

Public SSR and metadata consume only the public business endpoint; they never
forward business/customer cookies. Frontend whitelists public DTO properties.
Private customer state loads separately in the browser using credentials and
`cache: no-store`; no personal balances, names or offers appear in metadata/OG or
server-rendered shared responses. Backend/CDN must also set private/no-store on
session/OTP responses and never place private fields into the public DTO.
Metadata uses business name/description and public cover only.

### Owner configuration and media

GET `/api/v1/businesses/{businessId}/customer-page` returns businessId, slug,
publicUrl, status, branding, business info, module flags, social links, invitation
headline/message, Wallet setup states, and an active-content projection for preview.
PATCH that route updates content/light branding and invitation preferences only.
Do not accept arbitrary HTML, CSS, layouts or client-provided program/offer truth.
Shared business profile changes must update the same canonical business branding
used elsewhere, not create a second database source of truth.

PATCH `/customer-page/status` `{status}` requests activation/deactivation. Symfony
validates business permissions and availability. UI permissions are
`customer-page.read` and `customer-page.manage`; hidden buttons are not security.
POST `/customer-page/media` currently proposes multipart `{file, kind:logo|cover}`
returning a safe media URL; an agreed presigned-upload flow can replace this adapter.
Validate media/ownership server-side, provide appropriately sized web image variants
and public image URLs for cover/OG. Configure image optimization allowlists once
the actual media host is chosen. Blob/data previews are not server-optimized.

The Business QR screen reads this same configuration and canonical publicUrl;
logo, business name/city and printed invitation all come from Customer Page. It
does not maintain a second brand profile. Logo/city visibility on a print is a local
print preference. Keep old printed QR aliases stable when business display names change.

### Development previews

New-business editor starts with the real onboarding identity and empty active
content. Its customer preview is explicitly illustrative and creates no customer.
Development page drafts are scoped to businessId; local storage contains only
public presentation/configuration data, never personal customer/auth state or
base64 image contents. Mock uploads use temporary blob URLs, so uploaded images
can disappear after the owning browser document is closed/reloaded; public UI has
neutral image fallbacks. No activation is simulated.

Standalone public fixtures: `/b/your-coffee?lang=ru` (guest), `&demo=connected`,
`&demo=minimal`, `&demo=no-loyalty`, `&demo=offers`. They exist only in development.
The editor/QR link includes a development-only `preview=businessId` query that
reads the saved local public draft; this is not a production preview security token.
Production ignores those fixture parameters and always requests Symfony. Real
private draft sharing requires a backend-issued, permission-checked preview token.

## Business access, Team and Staff

Authentication must expose the current User separately from business memberships:
available businesses, selected business, membership ID, role (`OWNER`, `ADMIN`,
`MANAGER`, `STAFF`), membership status and explicit permissions for each business.
Role is a localized label, not a frontend authorization rule. Missing permissions
deny UI access. Symfony must enforce every permission independently of hidden UI.
The current login adapter retrieves this context through `GET /api/v1/me` after
login; final response and endpoint naming should be agreed with the backend.
Operational-only membership routes to `/staff`, otherwise overview access routes
to `/dashboard`. Business switching must refresh membership, grants and scoped data.

### Team contracts

Proposed business-scoped operations under `/api/v1/businesses/{businessId}/team`:

- GET: members (User summary, role, status, permissions, joinedAt, lastActiveAt)
  and invitations (email, role, status, expiresAt).
- POST `/invitations`: invite email and ADMIN/MANAGER/STAFF role; Symfony sends mail.
- PATCH `/members/{memberId}`: requested role or active/inactive status.
- DELETE `/members/{memberId}`: remove business access, not the global User account.
- POST `/invitations/{invitationId}/resend` and `/revoke`.

Invitation states: PENDING, ACCEPTED, EXPIRED, REVOKED. Backend validates authority,
business membership, invitation lifecycle, and ownership invariants including the
last OWNER. Ownership transfer is outside this editor. Return field/global errors
and authoritative updated state; do not expose private credentials or productivity
leaderboards. Development invitations are tab-local previews: no mail or access is
actually granted. New-business fixtures contain only the current owner.

### Staff contracts and audit

- GET `/api/v1/staff/context`: selected business, current User/membership and recent
  backend-recorded actions.
- POST `/api/v1/businesses/{businessId}/staff/resolve-customer`: scanned/manual code;
  return a minimal customer projection and eligible actions.
- POST `/api/v1/businesses/{businessId}/staff/customers/{customerId}/actions`:
  server-issued action ID plus idempotency key. Return updated customer and event.

Customer projection includes joined date, optional loyalty progress/reward
availability, membership visits, eligible offers, and available actions. Action
types include VISIT_CREATED, STAMP_ADDED, SUBSCRIPTION_USED, REWARD_REDEEMED and
OFFER_REDEEMED. Confirmation values such as remaining visits after redemption
must be supplied by Symfony; frontend does not calculate balances.

Every mutation validates business, member permission, customer ownership and
program/subscription state transactionally. Backend records businessId,
customerId, authenticated actor User/businessMember ID and timestamp with the
CustomerEvent/audit record. Never trust a client-supplied actor identity.
Idempotency prevents duplicate redemption on retries. Cookie/session transport
and CSRF protection must be agreed before enabling production mutations.

Camera use requires explicit browser permission; native QR decoding is used where
supported, with manual-code fallback. No customer is invented after a scan and
development adapters never award stamps, consume visits or simulate success.

### Campaign refinement contracts

Campaign status supports DRAFT, PROCESSING, PUBLISHED, PARTIALLY_PUBLISHED, FAILED,
PAUSED and COMPLETED. Provide per-channel publication state and createdAt; no
performance values are inferred. A campaign may reference an offer/product/service/
event ID, but remains a distribution entity distinct from that source. Channel
warnings use supported connected channels and configured Wallet surfaces.

### Development fixtures

Dashboard fixtures remain development-only: new, partial, active, manager and staff.
Team uses the active/partial fixture for populated access previews. Staff accepts
`/staff?lang=ru&demo=customer` for a read-only scanned customer fixture, and
`demo=denied`, `demo=unsupported`, `demo=error` for UI states. Production always
uses Symfony and never falls back to fixtures on API errors.

### Customer Page media progress
The upload adapter reports actual multipart byte progress using XHR, then a
processing state until the backend response. Media requests can be aborted and
have a transport timeout. Development uploads report local FileReader progress
and image decoding, then keep a completed state; they do not simulate a network
upload. Editor upload previews use compact fixed-height fields. Recommended media
dimensions remain square for logos and 2:1 for covers.

## PLAN AND USAGE / BUSINESS QUOTAS

Frontend entry: `/dashboard/billing`, account menu “Plan and usage”, compact
Overview summary. Requires business-scoped `billing.read`; changing plans also
requires backend-provided `canChangePlan`. No new sidebar item.

Proposed `GET /api/v1/businesses/{businessId}/usage` (secure cookie, no-store):
- `businessId`, `subscriptionStatus` (null if not activated);
- `plan`: null or `{id, name, price, currency, interval: month|year, limits}`;
- `metrics`: `{key, used, limit}`; currently activeCustomers and locations;
- `availablePlans` using the same plan/price shape; `canChangePlan`.
A numeric quota is finite, null means explicitly unlimited, an omitted quota
means unspecified (never silently interpreted as unlimited). Symfony owns price,
interval, availability, current counters, feature permissions and subscription
status. Locations count physical locations of one business, not businesses that
a User can access. Backend defines active-customer counting rules; frontend does
not derive them from a customer list.

`usageState()` centralizes display-only remaining, percentage, reached and
normal/warning/critical states (70% warning, 90% critical, >= limit reached).
Bars clamp visually; actual usage may exceed a limit and remains visible.
These values do NOT authorize creating customers/locations or any other action.
Future resource mutations must be checked transactionally by Symfony, with a
structured quota denial such as `{code: PLAN_LIMIT_REACHED, resource, limit}`.
`LimitNotice` renders that backend refusal with a billing link; do not merely hide
an Add location action. No location CRUD is introduced in this task.

Proposed `POST /api/v1/businesses/{businessId}/billing/plan-change`:
request `{planId, interval}`; backend returns a validated `checkoutUrl` or a
subscription-confirmation response contract to agree separately. Server verifies
permission, price, availability and entitlements; payment provider callbacks
activate the plan. Afterwards refetch usage/subscription from Symfony: existing
usage stays unchanged and the returned limits change. Never accept frontend
price/limit values as authoritative. Checkout provider host allowlisting should
be agreed before connecting live billing. No card data or local auth tokens.

Development uses isolated `src/mocks/dashboard/usage.ts`, the owner-provided
catalog in `src/config/plans.ts`, and memory-only plan comparison. Choosing a plan
updates the page preview limits but DOES NOT activate/modify a subscription or
simulate payment. New businesses have zero customers, no fixture employees or
campaign performance. An unspecified selected plan shows “No active plan”.
Growth location quota and Business quotas are intentionally unspecified pending
owner/backend decisions. Starter location quota is one. Active/partial fixtures
are explicit only; `/dashboard/billing?demo=partial&usage=near` and `usage=reached`
exercise warning/reached presentation. Production never imports fixtures or
falls back to demo on API errors.

Plan selection uses a dedicated `/dashboard/billing/plans` application page,
not a modal. Usage/change/upgrade links preserve the workspace locale and fixture
context. Development catalog descriptions reuse the onboarding translations;
production plan descriptions/features should be supplied by the plan catalog API.

## CUSTOMER ANALYTICS AND CUSTOMER PROFILE

Owner/manager customer UI now uses `/dashboard/customers` and
`/dashboard/customers/{customerId}`. Existing contact creation/editing stays in its
configuration draft adapter; no visit, loyalty, payment or sales mutation is
implemented by these analytics screens. Access is scoped to business membership
`customer.read`; backend must enforce this and redact finance/contact information
according to its permission policy. Frontend visibility is not authorization.

Proposed `GET /api/v1/businesses/{businessId}/customers/overview`:
query `period=7|30|90`, `segment=all|returning|inactive`, `search`, `page`.
Response `CustomerDirectory`:
- businessId, period, page, pageSize, totalResults;
- statistics: totalCustomers, newCustomers, visits, returningCustomers,
  inactiveCustomers, netSales, salesSource, trend;
- trend buckets: `{date, visits, newCustomers}` (a reasonable bounded bucket count
  for the selected period, aligned with the business timezone);
- customers: id, contact fields, notes, joinedAt, lastVisitAt, visitCount,
  backend-provided NEW/RETURNING/INACTIVE/UNKNOWN, spending, loyalty summary.
Statistics describe the whole business for the selected period. Search/segment
and pagination only filter the directory, not the aggregate. TotalCustomers and
inactiveCustomers are current counts; visits/new/returning and netSales use the
selected period. Lifetime visitCount and spending in each customer row must be
separate from period aggregates. Backend defines inactivity/returning criteria;
frontend never labels a customer inactive by calculating days since a visit.
Usage activeCustomers quota is a separate billing counter, not totalCustomers.

Proposed `GET /api/v1/businesses/{businessId}/customers/{customerId}/activity`:
response businessId, customer summary, memberships (status, remainingVisits,
validUntil), rewardsEarned, offersRedeemed, events, purchases, salesSource.
Events: id, type, occurredAt, optional detail, optional actorName. Types reuse
CUSTOMER_JOINED, QR_SCANNED, VISIT_CREATED, STAMP_ADDED, REWARD_EARNED,
REWARD_REDEEMED, SUBSCRIPTION_USED, OFFER_REDEEMED, CUSTOMER_RETURNED.
Backend provides chronological recent history, with a documented bounded page
size; cursor pagination can be added to history/purchases once the contract is
finalized. Actor attribution is authoritative backend audit data.
Purchase rows: id, occurredAt, description, netAmount and
PAID/REFUNDED/PARTIALLY_REFUNDED. Customer lifetime spending and period netSales
must come from actual sales/payment/POS data, including refunds. Never estimate
revenue from visits, offers, stamps or membership usage. These screens introduce
no accounting/business calculations. Without sales integration return null money,
empty purchases, salesSource NOT_CONNECTED; genuine zero is different from null.
Money is `{minor, currency, fractionDigits?}`; fractionDigits defaults to 2 for the
current EUR fixture, and backend must supply it for currencies with other scales.
Do not aggregate incompatible currencies into one amount.

All transport uses business-scoped secure cookies and `cache: no-store`.
Responses must match the requested business/customer. Search and pagination are
server-side in production. Aborted/stale requests must not overwrite another
business/customer screen. No personal data is SSR-cached or included in metadata.
Missing/unauthorized customers should use generic 404/403 semantics.

Development-only `src/mocks/customers/fixtures.ts`: default new business has no
customer history, visits, sales or seeded customers; manually entered tab-local
contact drafts show unknown history. Explicit `demo=active|partial|manager`
fixtures show illustrative customer analytics and profiles. No fixture fallback
is permitted in production. Fixture edits change contact drafts only, never
create historical visits, stamps or money. All UI labels support EN/LV/RU;
charts have a keyboard-accessible textual data table and need no chart library.

Directory also accepts `archived=true|false`, independent of the lifecycle
segment, so existing archive/restore UX remains available. Archived contacts do
not contribute to current directory counts. Contact archive/restore currently
remains development-only as before; no production CRM mutation is enabled by
adding the analytics screens.

### Development role preview
The local dashboard top bar and staff header contain a role-preview selector:
OWNER, ADMIN, MANAGER, STAFF. `previewRole` changes explicit mock membership grants
only, while preserving the business draft/fixture and locale across routes. STAFF
opens the focused `/staff` experience, with a selector to return to other roles.
The illustrative ADMIN fixture omits billing access; this is not a production
role policy. Backend-returned permissions remain authoritative in production.
The selector and role override are disabled outside development and when
NEXT_PUBLIC_DASHBOARD_MODE=api. No account role changes, auth/session mutation or
production impersonation endpoint is introduced.
