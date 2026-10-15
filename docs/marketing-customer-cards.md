# Shared marketing customer card

`src/components/customer/programme-card.tsx` and its scoped stylesheet now own the
card shell: business header, programme label, title, sage background, border,
spacing and loyalty stamp presentation. `LoyaltyProgress` remains the shared,
presentation-only progress renderer.

Used in Solutions, the personal Customer Page preview on Home/Product, the Product
hero, the marketing Scanner and its Wallet illustration. The return-journey Wallet
example reuses the same Wallet presentation instead of its own mini-card markup.

Solutions retains its industry-specific package, offer and history content inside
the common shell. Its coffee example now uses Your Coffee, the same translated
reward and the shared 4/6 fixture. Scanner deliberately starts at 3/6 and advances
to 4/6; both its card and Wallet example receive the same progress.

Actual business/customer state, Dashboard, public Customer Page operations and
Wallet issuance are unchanged. All examples remain isolated illustrations.

No browser or automated checks were run, respecting the user's standing request.
