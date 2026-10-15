# Marketing motion

The shared marketing Header mounts one MotionController. Home, Product, Solutions,
Pricing, About and pages using PublicShell use the same motion setup. Dashboard and
public customer operations are outside its selectors.

- Microinteractions: 180 ms; view transitions: 320 ms; reveals: 500–560 ms.
- Native Web Animations and CSS; no added dependencies.
- Scroll reveals start only after intersecting. No hidden pre-JavaScript content.
  H1 remains opaque to avoid delaying its visibility. Sections and selected card
  groups use bounded 65 ms stagger, capped at 260 ms.
- Existing homepage flow scenes, Solutions selection, FAQ animation and mobile
  navigation are retained rather than duplicated.
- Campaign channels reveal in sequence. Customer Page views occupy one shared
  grid cell, preserving the taller view's space during a crossfade.
- The marketing scanner demo has idle / confirmation / completed states. It changes
  only its isolated example from 3 to 4 stamps, including the illustrative Wallet
  card. It writes no workspace state and calls no API. Replay resets the example.
- CTA arrows move 3 px on fine-pointer hover; press translates 1 px. Primary CTA
  text colours remain governed by existing styles. Keyboard outlines are explicit.
- Reduced motion skips reveals, stops ongoing Web Animations and disables demo
  animation. Observers, animation handles and preference listeners are cleaned up.

No browser, lint, typecheck, tests or build have been run for this change. The user
previously prohibited checks; clarification was requested because the latest brief
contains conflicting verification instructions. Desktop/mobile rendering, all
locales, keyboard interaction and runtime behaviour remain unverified.
