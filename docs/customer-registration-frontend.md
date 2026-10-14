# Customer Registration & Multi-Business Experience

## Frontend implementation

Existing Customer Page is the entry point; Join opens `/b/{slug}/join` with business preview and language preserved. Business branding and loyalty reward use the existing public projection. The existing telephone OTP adapter is reused without endpoint/DTO changes; email identification, resend contract semantics and completion fields are not invented as live API operations.

The local prototype's main action explicitly selects a fictional identity (`.test` email). A separate action exposes the OTP screen: verification/resend fail honestly as unavailable, never marking contacts verified. OTP/challenges are component memory only. The preview is neither authentication nor a production substitute.

Customer Page Builder includes registration settings: required name/email/phone toggles, separate optional email/SMS marketing consent, live form preview and a local save action. Settings are business-scoped public presentation drafts in localStorage (`memberflow:customer-registration:v1:{businessId}`). Production editing remains disabled until its contract exists; policy data is not added to current Symfony requests.

A fictional customer profile and its participations live in tab-local sessionStorage (`memberflow:customer-account-preview:v1`). Participation stores separate business/customer/programme IDs, shared fields, optional consents and a join timestamp. Only missing profile fields are requested in the next business. Already known values appear in a disclosure summary, with explicit per-business confirmation before sharing. Unrequested email/phone never enter that business's CRM record. Marketing is never prechecked. Existing business-scoped CRM records and prototype journal provide programme progress/history/rewards; no second CRM or Scanner exists.

Stable participation customer IDs and operation keys protect retries. A failed local join restores its prior session/CRM/journal snapshots. No-programme joining records a truthful customer-registration event without fabricating loyalty or visits. Archived programmes/customers and inactive pages cannot produce a new eligible participation.

Reopening the business restores the same participation; the registration route shows Open my card. Ending the preview marks it inactive, while reselecting the same fictional identity in the same tab resumes its existing participations instead of creating another customer. Cancellation preserves only an already explicitly selected fictional preview profile; unfinished forms/OTP are not saved.

The personal Customer Page has a locally generated QR using the existing Scanner code format. It is independent of Wallet. Wallet unavailable states are visible; existing server-provided AVAILABLE/ADDED states remain supported. No Wallet pass is generated and no add action reports synthetic success. Public guest mode (`guest=1` for explicit development inspection) contains no personal QR or assignments. Private preview data is never SSR/metadata/localStorage.

EN/LV/RU and mobile-oriented form styles are included. A Draft/Disabled page points to Builder activation; it is not silently activated.

## Future Symfony contracts to agree, not implemented

- A customer identity/session separate from business User authentication; verified contacts and server-owned OTP challenge, delivery, resend/rate limits, expiry and verification.
- Approved public registration policy, distinct from account identification; allowed/required business fields and separate marketing choices.
- Missing-fields response for the current authenticated customer and business, including what may be disclosed and on which basis.
- Idempotent business participation creation/lookup with server authorization, sharing/consent records and required-field validation.
- Personal participation DTO: independent QR, programme progress, available rewards, offers/history and Wallet issuance/add states per business.
- Server-owned logout, cross-device identity and durable participation retrieval; no browser preview is a security mechanism.

Current transport/endpoints/database/authentication implementation remain unchanged. No backend API was added. Production API never falls back to local identity or events.

## Verification status

Before the user's subsequent instruction to stop testing, the unit suite completed 24/24. Typecheck and lint had passed earlier snapshots. Final changes, the new Playwright scenarios and production build were not verified after that instruction; no final E2E/build success is claimed. The Playwright scenarios are present for later authorised execution. Registration, profile and card styles target 390/430/768/1024/1440, but their browser rendering remains unconfirmed.
