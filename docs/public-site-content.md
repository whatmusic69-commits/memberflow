# Public site: content and capabilities

Solutions, Integrations and Help are localized static frontend content. Solutions previews are fictional business examples and local visual fixtures; stamps, visit packages and offers do not create records. Help has nine guides per language, stored as structured JSON under `src/content/public-site`. Article slugs are shared across locales. Search filters titles, categories, summaries and article body locally. No customer information is indexed.

## Integration evidence

- Apple Wallet / Google Wallet: workspace connection DTOs and Customer Page provider actions; issuance/action URLs and activation require Symfony.
- Instagram, TikTok, Pinterest: workspace integration UI and `src/mocks/dashboard/newBusiness.ts`; these describe planned distribution, not confirmed live OAuth or publishing.
- Google Business Profile: `Google Business` in the new-business fixture; exact publishing capabilities remain unconfirmed.
- Facebook: `src/features/customer-page/types.ts` social links only. No confirmed campaign connector.

Wallet pass updates are separate from notification delivery. No guaranteed push claims or fake connection controls are provided.

## Pricing

Prices and limits continue to use the existing `src/config/plans.ts` catalog or the existing public Symfony adapter. Local comparison cells point to exact entries in the same translated feature lists, through `developmentComparisonFeatures`; they do not infer inherited features, programme counts or absence of unlisted features. Full feature lists remain visible for backend catalogs, whose opaque strings cannot safely define a complete entitlement matrix.

For complete production comparison, the Symfony developer needs to extend the existing public plan DTO with agreed stable feature keys and values (e.g. `customerPage`, `wallet`, `campaigns`, `crm`, `analytics`, `staff`, `automations`, `loyaltyPrograms`) plus explicit quantities where relevant. Unknown/omitted values remain unspecified, never unlimited or excluded. This work does not change the current API contract or implement endpoints.

## Backend boundaries

Real registration/OTP, business activation/payment/trials, public slug uniqueness, media persistence, publishing Customer Page changes, Wallet issuance/updates, staff permissions/scanner events, loyalty accrual/redemption, customer records and social publishing remain Symfony-owned. Registration links open the existing onboarding UI. No backend, OAuth or billing execution was added.

Privacy and Terms routes exist. They contain a localized pending-legal-review notice and stay noindex until approved text is supplied; no legal terms or company details were invented.
