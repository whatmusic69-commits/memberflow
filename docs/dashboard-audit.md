# Dashboard audit (2026-10-13)

## Existing implementation before changes

| Section | Working UI and storage | Existing links / gaps |
| --- | --- | --- |
| Overview | Lifecycle, next action, results, campaigns/activity panels; Symfony adapter, empty new-business default, explicit active/partial fixtures | Only campaign drafts affected new-business setup. Created customers/programmes/offers did not drive summary. |
| Campaigns | Create/edit, validation, channel preview, details, search/status filters; business-keyed sessionStorage drafts | Optional `source` DTO existed, no Offer selector; references not resolved on subsequent reads. No local publish (correct). |
| Offers | Create/edit, validation, search, archive/restore; module repository | Automation selects Offer ID; Customer Page did not read module drafts. |
| Customers | Directory, segments, periods, pagination, profiles, history, contact edit and archive | Separate illustrative analytics fixture; contact drafts merged. New local customers had no joins/progress/history. |
| Customer Page | Profile/branding/contact forms, image preparation, guest/customer previews, QR/poster, backend status action | Separate localStorage business copy; stale settings. Local activation returned unavailable. Content stayed empty after module creation. |
| Loyalty | Stamp/points editor, target/reward, visual preview, search/archive | Configuration only; no local participation or action journal. |
| Memberships | Subscription/package editor, prices/visits/interval, preview/archive | Configuration only; no execution. |
| Automations | Name, inactivity period, Offer ID, channel; preview/archive | No execution (correct); service did not validate archived/missing reference. |
| Team | Invitation form, member changes, revoke/resend/remove with existing permission gates; tab storage | Explicit fixture roles OWNER/ADMIN/MANAGER/STAFF. Invitation email and real authorisation remain backend-owned. |
| Integrations | Provider details/statuses and backend authorisation URL guards | No fake OAuth; local states are fixtures. |
| Settings | Business/profile/billing tabs, validation, logo/color preview; tab storage | Shares summary through overview reload, but not canonical Customer Page data; profile save rewrites business fields unnecessarily. |

## Cross-cutting audit

- The architecture already has business-scoped repositories, typed DTOs, Workspace context, no-store Symfony transports and events. A new state framework/database is unnecessary.
- Local module, campaign, team and onboarding drafts use sessionStorage; Customer Page presentation uses localStorage. Credentials/OTP/access tokens are not persisted. Existing base64 Settings logo storage is removed from persistent shared presentation.
- Business switch UI exists, but demo `getOverview` ignored requested ID and `applyBusinessSettings` collapsed the catalog to one entry. Selected ID was only component state, so refresh and staff role navigation lost context.
- Staff camera scanner, manual code entry, permission filter, confirmation and idempotency request key already exist. Demo resolve/execute returned unavailable.
- Empty examples already differ by section and disappear when module records exist; preserve this behavior rather than redesign it.
- Production reads must stay Symfony-only. New executable frontend behavior must be explicitly local development prototype behavior and never imply real activation, publishing, Wallet, billing or customer authentication.

## Implemented

- Reused existing Workspace, repositories, DTOs and events. Public business presentation has one versioned source, shared by Settings, Customer Page and business summaries. Owner display name remains separate. Legacy presentation is read safely; temporary uploaded images remain in memory, never persistent base64.
- Business selection survives refresh, locale and Staff navigation through the existing URL. Draft records and journal operations are business-scoped; requested unknown businesses cannot silently fall back to another business. Onboarding remembers multiple local business summaries.
- Loyalty definitions feed the existing Customer Page. Explicit development preview can join a programme, create a fictional contact and use the existing CRM/Scanner for visits, stamps/points, earned rewards and redemption. All views project the same journal. Operation keys prevent duplicate application and conflicting retries. Real authentication, accrual and authorisation are unchanged and belong to Symfony.
- Campaigns select existing Offers by ID; Automations validate the same references. Updated Offer descriptions appear on subsequent reads. Referenced Offers cannot be archived while nonarchived dependants exist. Campaign archive/restore has filters and confirmation; no sending/publishing is simulated.
- Overview uses recorded customers/events and local configuration for counts, recent activity and setup checklist. Revenue remains absent. Returning means at least two recorded visits; inactive means last recorded visit older than 30 days; no visit means unknown. Explicit populated fixtures seed only their known events, not fabricated aggregate history.
- Existing Staff scanner resolves a business-scoped preview code, confirms permission-allowed journal actions and refreshes CRM. Team mutations preserve Owner protections, validate invitation email and refresh existing permission context. Frontend permissions are UX only.
- Existing section-specific empty examples and actual lists were retained. No design replacement, backend endpoints or new state framework were introduced.

## Local walkthroughs

1. In development, change Business Settings name/contact/branding → Customer Page editor and Dashboard show the same presentation → enable local Customer Page preview → generate QR in the existing connection screen. These are local preview steps, not real publication.
2. Create Loyalty → open Customer Page preview in the same tab → join using a fictional name → CRM contains the participant → open their existing Scanner preview code → record visits/accrual → reach reward threshold → redeem once → inspect the same progress/history in CRM and Customer Page.
3. Create Offer → select it in Campaign and Automation → edit the Offer → linked previews use the current description → archive dependent drafts before archiving the Offer. No messages are sent.
4. Create another onboarding preview business → switch business → verify its separate configuration, contacts, journal and drafts → refresh or change locale without losing selection.

## Storage and limits

- localStorage: versioned public business presentation and Customer Page presentation/configuration only. No passwords, OTP, tokens, customer session or private customer history.
- sessionStorage: business catalog, owner display-name draft, existing business-scoped configuration/contact/team/campaign drafts, prototype journal and QR-preview checkpoint. These survive refresh in the same tab, not an authoritative cross-device store. Use fictional contacts; no new persistent customer identity is introduced.
- Uploaded temporary images live in memory and disappear after reload. Persistent media needs Symfony upload URLs.
- New membership definitions remain configuration drafts; the pre-existing explicit membership fixture supports visit usage in the shared journal. New assignments, billing and authoritative expiry remain backend work. Location events currently reference one stable main-location ID; no additional location-management system was built.
- Public preview selection is client-only, explicitly local and unauthenticated. No private customer state is included in public SSR/metadata. Wallet issuance, social OAuth, campaign execution and real customer-page activation remain unavailable without Symfony.
- Programme participation snapshots its target/reward; changing configuration does not rewrite historical reward rules. Symfony must define authoritative versioning/migration policy.

## Symfony handoff

Keep the existing no-store adapters. Symfony needs authoritative business/public-profile and location DTOs, customer participation/progress/reward/history DTOs, business-scoped visit/accrual/redemption/membership actions with idempotency keys and staff authorisation, customer session/OTP, page activation/slug validation/media persistence, invitations, publishing and billing. The local reducer is a development preview only and must never become production business logic.

## Verification

- Passed: `npm run lint`, `npm run typecheck`, `npm run test:unit` (11/11), `npm run build -- --webpack`, `git diff --check`.
- 11 Node unit scenarios cover shared presentation, identity separation, business isolation, permissions, Offer references, journal retries/rewards, customer search/archive/inactivity/statistics, corrupt storage, API-mode guards and known fixture events/membership usage.
- Browser checks were intentionally omitted during the initial audit implementation. The subsequently requested Chrome/Playwright verification, responsive checks and resulting fixes are documented in [frontend-e2e-verification.md](frontend-e2e-verification.md).
