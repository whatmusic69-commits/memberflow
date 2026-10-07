# MemberFlow frontend

This is a standalone frontend repository. Backend lives in a separate repository owned by the Symfony developer.

## Frontend ownership
Next.js, React, TypeScript, UI/UX, marketing website, business dashboard UI, customer-facing web UI, forms, API client, displaying backend data, frontend state, responsive layouts, accessibility.

## Backend ownership — never implement here
Symfony, database, Doctrine, migrations, EasyAdmin, Apple Wallet pass generation/signing, social API server integrations, loyalty calculations, subscription calculations, permissions/business authorization, backend authentication implementation, queues/workers, server-side campaign publishing, business rules.

Do not add Prisma, Firebase, Supabase, databases, or Next.js business endpoints as substitutes for Symfony.

## New backend capabilities
Define necessary request/response data, prepare the frontend for the endpoint, use isolated demo data where necessary, and explicitly document the endpoint needed by the backend developer. Symfony remains the source of truth. Never implement a replacement backend inside Next.js.

## Project conventions
- Server Components by default; client components only for interaction.
- Marketing translations live in src/content; support EN, LV, RU.
- UI fixtures live in src/data/demo (marketing) and src/mocks/dashboard (workspace); illustrative, never claimed as real customers or results. Dashboard production always uses the Symfony adapter; development defaults to the empty new-business fixture.
- Future REST transport lives in src/lib/api; homepage must work without an API URL.
- Keep feature code, shared UI, content, and types separate.
- Preserve semantic HTML, keyboard access, focus styles, reduced motion, and mobile readability.
- No invented metrics, testimonials, company legal details, or claims that planned integrations are live.
- Public homepage and business onboarding UI are in scope. Login and password-recovery UI are also in scope. Business Dashboard Overview and frontend Customers, Loyalty, Memberships, Offers, Automations, Integrations and Settings screens are now in scope, alongside Campaigns. Use typed business-scoped demo repositories for local configuration drafts; no execution, accrual, billing or production mutations. Development campaign drafts are tab-local previews only; do not simulate publishing. No live authentication, billing, CRM workflows, or integrations without separately authorised API integration.
- Onboarding: Owner account → Business → Goals → optional Profile → Plan → backend payment/trial → Ready → Workspace. User and Business are distinct; a User may manage multiple businesses.
- Loyalty, Wallet, social connections, campaigns and staff setup belong to post-payment activation, never registration.
- Production plans, prices, availability and entitlement come from Symfony. Development placeholders cannot activate subscriptions.
- Do not persist passwords or onboarding credentials in browser storage.
- Customer analytics and individual customer profiles are in scope. Visits, inactivity states, loyalty, memberships and spending come from business-scoped Symfony DTOs; never infer sales from visits or calculate loyalty on the frontend. Production analytics uses no-store transport, with no demo fallback. Development contact edits remain tab-local drafts and cannot create customer history or monetary events.
- Customer Page is the central customer web interface; Business QR is its entry point. Owner configuration lives at /dashboard/customer-page and public pages at /b/{backendSlug}. QR/poster branding and invitation come from that same configuration; never build a website builder or duplicate active offer/program content.
- Customer session is separate from business User authentication. Public SSR/metadata must contain only approved public business data; private customer state loads separately with no-store and never enters shared cache or metadata. Symfony owns OTP, public slug uniqueness, activation, media persistence, customer linkage and Wallet issuance. Development customer-page drafts may store public presentation data only, never personal customer/auth data or base64 images.
- Run lint, typecheck and production build after relevant changes. The user currently checks browser visuals locally: do not run tests or browser checks unless asked. Design for EN/LV/RU and widths 1920/1440/1280/1024/768/430/390.
