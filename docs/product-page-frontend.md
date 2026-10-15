# Product page and shorter homepage

Routes: `/en/product`, `/lv/product`, `/ru/product`. Server page uses existing public metadata helper (unique title/description, absolute canonical, language alternates and Open Graph) and static locale params. Existing home metadata is unchanged. The repository has no generated frontend sitemap, so no sitemap pipeline was altered.

## Reuse and privacy

Header, Footer, StartLink and existing onboarding remain shared. Product uses CustomerPagePreview (guest/personal tabs), StaffStory, ActivityStory, CampaignStory, WalletExplanation, ReturnJourney, DemoQr and LoyaltyProgress. All data comes from public marketing content and existing `src/data/demo/home` illustrations. No workspace context, customer session or private Dashboard transport is imported by the marketing presentation.

CustomerPagePreview now uses instance-specific React IDs, so hero/body examples can coexist with working keyboard navigation and correct aria associations. No extra animation/dependency package was added.

## Product composition

- Hero: the customer page next to a compact loyalty preview, real onboarding CTA and a journey anchor.
- One QR: six connected stages with small interface illustrations, rather than a paragraph list.
- Your business, your page: the existing interactive guest/personal preview and public-page capabilities.
- Loyalty: existing staff/customer composition, stamps/points/rewards explanation and honest Wallet notes.
- CRM: existing customer activity illustration with profiles/history/segments explanation.
- Offers/campaigns/automations: existing preparation preview and return journey; no publishing/sending claims.
- More: four compact linked items for memberships/packages, team, integrations and business settings.
- Business uses: short coffee/salon/fitness/restaurant scenarios linking to Solutions.
- Final CTA: the existing onboarding route.

Wallet issuance, notifications, real authentication and message delivery remain explicitly dependent on connected services. Demonstration balances and visits are labelled illustrations; no revenue, testimonials or performance uplift was added.

## Homepage and navigation

Homepage keeps Hero, a compact Why statement, existing key Benefits, short interactive ProductOverview, business types and FinalCTA. The four long Story chapters no longer render there; their presentation widgets are reused on Product. The long return-journey/Wallet explanation is removed from home and reused where relevant on Product. Full FAQ remains available on its separate page and in Footer. Old components remain available rather than being deleted.

ProductOverview links clearly to Product and Pricing. It retains `id=product` for existing external homepage anchor links. Header/Footer Product links now use the locale Product route. Pricing's product link does likewise; homepage business-type links now lead to Solutions. Language switching preserves Product via the existing MarketingPage routing mechanism.

## Responsive design and checks

Layout styles target 390/430/768/1024/1440: one-column hero on smaller widths, two-column journey on phones, stacked CRM/campaign demos and preserved readable previews. No claim is made that those layouts were browser-verified.

Checks have not been run: the user's repeated prior instruction prohibited tests/browser/build, and clarification for this task has not been answered. No lint, typecheck, E2E or production-build success is claimed. The task contains only frontend changes.
