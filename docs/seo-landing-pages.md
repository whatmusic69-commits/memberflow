# SEO landing pages and Footer

## Audit and scope

Existing Home, Product, Solutions, Pricing, Integrations, Help and About use the
shared marketing Header/Footer and EN/LV/RU content. PublicShell/publicMetadata,
StartLink, ProgrammeCard/LoyaltyProgress, CustomerPagePreview, BusinessDemoQr,
StaffStory and FAQItem were reused. No sitemap or robots metadata routes existed.
Dashboard metadata already declares noindex; it was not changed.

## New pages

Each exists in English, Latvian and Russian:

- `/[locale]/solutions/coffee-shops`: coffee counter journey, staff-confirmed
  stamps, digital versus paper and visit history. Hero uses the existing loyalty
  card; the journey includes CustomerPagePreview.
- `/[locale]/solutions/beauty-salons`: repeat appointments, three distinct return
  offer examples, recorded activity. The illustrative salon profile/offer does
  not claim scheduling or a working campaign delivery service.
- `/[locale]/features/digital-loyalty-cards`: what a personal card is, registration,
  customer/staff workflow, optional Wallet. Hero uses the interactive existing
  public/personal page preview, with benefits for customer, team and owner.
- `/[locale]/features/qr-code-loyalty`: business QR versus personal customer QR,
  registration-to-reward journey, existing scanner demonstration. Marketing QR
  codes open demonstrations and are explicitly not actual customer credentials.

Translations are in `src/content/landing-pages`; rendering is server-first through
LandingPage and two constrained dynamic route families. Unsupported slugs return
notFound. Existing interactive previews retain their client boundaries.

## Footer and linking

The marketing Footer now has a brand/registration block and Product, Solutions,
Resources and Company groups, then copyright, legal and language links. Legal
links appear once at the bottom to avoid duplicating them in Company.

Restaurants and Fitness Studios link to real industry states on Solutions;
Customer Retention and How It Works link to existing sections of Product. These
are not additional fabricated routes. Solutions reads its industry hash on entry
and hash changes. Footer and Header language switching preserve all new paths.
Product links to both feature pages, Solutions to both industry pages, and each
landing links to related pages, Pricing and existing onboarding.

Customer Page retains its own small Footer and business contacts/social links.
It gained only platform Privacy/Terms links, not marketing navigation. No business
legal policies or contact details were invented.

## Technical SEO

- Unique translated title/description/H1 for all four pages; publicMetadata adds
  canonical, EN/LV/RU/x-default and Open Graph. x-default points to the existing
  English counterpart. Root metadataBase uses the shared public origin.
- Home and About gain matching default-language alternates and Open Graph URLs.
- BreadcrumbList JSON-LD mirrors the visible, real breadcrumb links. No invented
  reviews, ratings, sales figures or organisation/legal schema.
- `/sitemap.xml` includes public marketing pages and available Help articles,
  language alternates and the new landing pages. It excludes legal placeholders,
  workspace/auth/onboarding, customer pages and preview URLs. No artificial
  last-modified dates are generated.
- `/robots.txt` references the sitemap and excludes workspace/auth/setup and
  preview-query crawling. These are crawler directives, not access control.
- Customer Page metadata explicitly marks preview/demo/prototypeCustomer/guest
  query modes noindex in every environment. Approved public business metadata
  for normal pages remains separate from private client-loaded data.

The public origin remains `https://memberflow-seven.vercel.app`, now centralised
in `src/config/public-site.ts`.

## Legal and capability limits

Privacy and Terms routes already exist for all locales, but contain pending legal
review notices. They retain noindex and are excluded from sitemap. Approved legal
texts and any business-specific policy URLs remain outstanding.

Wallet issuance needs its integration; no notification guarantee was added.
The salon page does not promise online scheduling. QR scans are not described as
automatic visits, purchases or rewards. No backend/API, auth, scanner operation,
plan entitlement or Dashboard workflow was changed.

## Verification status

No browser, lint, typecheck, unit, E2E or production build was run, respecting the
user's standing prohibition. Earlier native browser access was denied by OS
permissions. The dev server was not started or restarted. Source inspection was
used to connect existing routes/components; runtime output, SEO XML, EN/LV/RU
rendering and the requested 390/430/768/1024/1440 widths remain unverified.
