
# Decision Log — AI Shopping Agent

> A running record of every significant decision made during the build:
> **"We considered X, chose Y, because Z."**
>
> *Submitted for Shopify AI Shopping Hackathon 2026 · KIIT Bhubaneswar*

---

## 001 — AI Provider: Groq (Llama 3.1) over OpenAI GPT-4o

**Considered:** OpenAI GPT-4o, Anthropic Claude, Groq (Llama 3.1)

**Chose:** Groq with Llama 3.1

**Because:**
- Groq's inference speed (~600ms) makes conversations feel instant. GPT-4o at 3–4 seconds breaks the conversational flow in a shopping context where users expect immediate feedback.
- Groq's free tier covered our full hackathon load with zero API cost pressure, letting us focus on product quality rather than token budgets.
- Llama 3.1 handles vague, cross-category shopping queries well enough for our use case. The marginal quality gap vs GPT-4o did not justify the latency and cost tradeoff.

**Tradeoff accepted:** Llama 3.1 produces slightly less structured JSON output than GPT-4o. Mitigated with explicit prompt formatting instructions and server-side response validation.

---

## 002 — Authentication: Firebase Auth over Custom JWT Backend

**Considered:** Custom JWT backend (bcrypt + refresh tokens), Firebase Authentication, Auth0

**Chose:** Firebase Authentication

**Because:**
- Building secure auth from scratch — password hashing, token expiry, session invalidation, refresh token rotation — costs a full day minimum. Firebase handles all of this out of the box.
- Firebase's `onAuthStateChanged` listener integrates cleanly with React Context, giving us persistent sessions with three lines of code.
- Auth0 was ruled out due to free tier limitations on monthly active users.

**Tradeoff accepted:** Vendor dependency on Google's auth infrastructure. Acceptable at hackathon scale; migration to a custom backend is straightforward post-launch.

---

## 003 — Product Data: Shopify Storefront API over Mock Dataset

**Considered:** Static JSON mock dataset, Shopify Storefront GraphQL API, Fake Store API

**Chose:** Shopify Storefront GraphQL API

**Because:**
- A mock dataset would have made the demo feel dishonest. Real products, real prices, and real inventory status from an actual Shopify store make the AI recommendations credible.
- GraphQL lets us fetch exactly the fields we need (title, price, images, variants, tags) without over-fetching, keeping response payloads lean.
- The Storefront API is designed for customer-facing apps — it's scoped to read-only catalog access, so no admin credentials are needed on the client-facing server.

**Tradeoff accepted:** Shopify API introduces 3–5 second latency under load and has rate limits. Mitigated with a skeleton loading state and typing animation to mask the wait perceptually. Long-term fix is Redis caching on category-level queries.

---

## 004 — State Management: React Context API over Redux

**Considered:** Redux Toolkit, Zustand, React Context API with custom hooks

**Chose:** React Context API

**Because:**
- Three bounded contexts (AuthContext, CartContext, CheckoutContext) do not justify Redux boilerplate. Context API with `useReducer` delivered identical capability in a fraction of setup time.
- Adding Redux would have consumed 3–4 hours of the hackathon window on tooling rather than product features.
- Zustand was a close second — ruled out only because the team was more fluent in Context patterns.

**Tradeoff accepted:** Less DevTools visibility compared to Redux. Acceptable for this scope; state complexity does not warrant Redux's overhead.

---

## 005 — Voice Input: Web Speech API over Whisper

**Considered:** OpenAI Whisper (server-side), Web Speech API (browser-native), AssemblyAI

**Chose:** Web Speech API

**Because:**
- Whisper requires a full server round-trip: record audio → upload → transcribe → return transcript. That's 2–4 seconds of added latency before the AI pipeline even starts.
- Web Speech API is in-browser, returns transcription in under 200ms, and costs nothing. The result feeds directly into the same chat pipeline as typed input — zero additional infrastructure.
- We implemented continuous recognition with `interimResults: true` so users see live transcription as they speak, making the experience feel native and responsive.

**Tradeoff accepted:** Chrome and Edge only — Firefox and Safari do not support `webkitSpeechRecognition`. We surface a clear tooltip on unsupported browsers rather than silently degrading.

---

## 006 — Multi-category over Single Niche

**Considered:** Deep single-category assistant (e.g., pure fashion with style profiling), broad multi-category assistant

**Chose:** Multi-category

**Because:**
- We wanted to validate whether one AI interface could span meaningfully different shopping behaviors — spec-comparison for gadgets, aesthetic preference for fashion, visual browsing for home decor — without per-category prompt engineering.
- A single-category build would have been a narrower proof of concept. Multi-category tests the generalization of the recommendation engine.
- The system prompt instructs Llama 3.1 to detect category context from the query itself before matching products.

**Tradeoff accepted:** No category-specific features in v1 — outfit matching, spec comparison tables, or size recommendation are out of scope. We proved the flexible layer first; depth comes next.

---

## 007 — Checkout: Separate Pages over Sidebar/Modal

**Considered:** Inline checkout inside chat sidebar, modal overlay, dedicated multi-step pages

**Chose:** Dedicated multi-step checkout pages (Shipping → Payment → Review → Success)

**Because:**
- Users trust checkout pages that look like real pages. Overlays and sidebars signal "this is not a real checkout" and reduce conversion confidence.
- Separate pages give each step visual weight and focus — users aren't distracted by the chat interface while entering payment details.
- React Router makes step navigation clean, and the browser back button works intuitively.

**Tradeoff accepted:** Slightly longer navigation path vs an in-chat checkout. The trust signal was worth the extra step.

---

## 008 — Deployment: Vercel (Frontend) + Render (Backend)

**Considered:** Vercel + Railway, Vercel + Render, Netlify + Heroku, single full-stack on Railway

**Chose:** Vercel for frontend, Render for backend

**Because:**
- Vercel's GitHub integration auto-deploys on every push with zero configuration for React apps. It also provides edge caching for static assets globally.
- Render's free tier supports persistent Node.js web services with environment variable management — enough for hackathon load.
- Keeping frontend and backend on separate platforms gives us independent deploy pipelines and failure isolation.

**Tradeoff accepted:** Render free tier has a cold-start delay (~30 seconds after inactivity). We added a loading indicator on the first API call to handle this gracefully.

---

## 009 — Personalization: localStorage over Server-side User Profiles

**Considered:** Firestore user profiles, server-side preference storage, localStorage session utility

**Chose:** localStorage via a `userSession` utility

**Because:**
- Server-side preference storage requires authenticated API calls on every page load — adding latency and backend complexity for a feature that is primarily a UX enhancement.
- `localStorage` gives us instant access to search history, viewed products, and preferred categories with zero network overhead.
- The personalized welcome message and recent search chips are rendered from local data before any API call fires.

**Tradeoff accepted:** Preferences are device-specific and don't persist across browsers or after clearing storage. Acceptable for v1; Firestore-backed profiles are the obvious next step.

---

## 010 — Payment: UI Prototype over Real Gateway Integration

**Considered:** Razorpay, Stripe, PayPal SDK, UI-only prototype

**Chose:** UI prototype (no real payment processing)

**Because:**
- Integrating a real payment gateway (Razorpay or Stripe) would have shifted 8–10 hours of focus away from the AI shopping layer, which is the actual innovation being evaluated.
- A payment integration also requires webhook handling, order state management, and failure recovery flows — all of which are non-trivial to get right under hackathon time pressure.
- The checkout UI is architected to map directly to Razorpay and Stripe SDK inputs — the form fields, step structure, and order object are all compatible. Integration is an additive change, not a rewrite.

**Tradeoff accepted:** No real transactions in this build. We were transparent about this scope decision in the demo context. The AI shopping and recommendation layer — which is the core thesis — works fully end-to-end.

---

## 011 — Suggested Prompts: Chips over Blank Input

**Considered:** Blank chat input only, onboarding modal with examples, clickable prompt chips

**Chose:** Clickable prompt chips below the welcome message

**Because:**
- Early internal testing revealed that a blank chat input creates hesitation — users don't know where to start, especially on first visit.
- Prompt chips reduce the blank-page problem without making the interface feel scripted. They're suggestions, not forced flows.
- Chips also double as mobile-friendly tap targets, which is important given our mobile-first design approach.

**Tradeoff accepted:** Chips take up vertical space on smaller screens. Mitigated by showing them only when the conversation has one or fewer messages, and hiding them once the user starts chatting.

---

<div align="center">

*This log reflects decisions made during the Shopify AI Shopping Hackathon 2026.*
*Built by Aarushi Sharma & MD. Khustar Noorani · KIIT Bhubaneswar*

</div>
