# Team Contribution — AI Shopping Agent

> **Submitted for:** Shopify AI Shopping Hackathon 2026
> **Institution:** Kalinga Institute of Industrial Technology (KIIT), Bhubaneswar
> **Category:** Conversational Commerce / AI Shopping Assistant
> **Repository:** [github.com/aarushhii30/AI-shopping-agent](https://github.com/aarushhii30/AI-shopping-agent)

---

## 👩‍💻 Aarushi Sharma — Frontend Engineer & Product Lead

| Area | What Was Done |
|---|---|
| **Firebase Setup & AuthContext** | Set up Firebase project, configured Authentication, built `AuthContext.js` — login state, JWT session persistence, token refresh, protected route logic |
| **API Integration Layer** | Built `api.js` — all Axios calls from frontend to backend, request formatting, response parsing, and error propagation |
| **Voice Assistant** | Integrated Web Speech API — continuous recognition, live interim text display, Mic/MicOff toggle, Chrome/Edge support with graceful fallback |
| **Session & Personalization Logic** | Built `userSession.js` — localStorage-based search history, viewed product tracking, preferred category scoring, personalized welcome messages |
| **Checkout Form Validation** | Wrote full client-side validation logic for shipping and payment forms — field rules, error states, UPI format check, card number formatting |
| **Chat UI** | Built the full chat interface — message rendering, typing indicator, product cards inside chat, suggested prompts, recent search chips |
| **Authentication Pages** | Built login and signup screens with Firebase error code mapping and form validation |
| **Checkout & Cart Pages** | Built all checkout steps (Shipping → Payment → Review → Success) and cart UI with quantity controls and GST breakdown |
| **Styling & Responsive UI** | Wrote all CSS — dark theme, animations, mobile-first responsive layout, safe-area fixes for iOS |
| **Product Documentation** | Wrote the full Product Thinking doc — problem statement, user journeys, key decisions, and roadmap |

---

## 👨‍💻 MD. Khustar Noorani — Backend Engineer & Systems Architect

| Area | What Was Done |
|---|---|
| **Express Server** | Built the Node.js/Express backend — all API routes (`/api/chat`, `/api/products`), middleware, rate limiting, CORS, error handling |
| **Groq AI Integration** | Integrated Groq API (Llama 3.1) — system prompt engineering, intent extraction, product ranking, conversational response generation |
| **Shopify Storefront API** | Wrote all GraphQL queries — real-time product fetching, category filtering, price-range matching, variant handling |
| **Firebase Admin SDK** | Set up server-side Firebase Admin — ID token verification on every protected API request, security middleware |
| **CartContext & CheckoutContext** | Built React contexts managing global cart state, GST calculation (18%), promo code validation, and checkout step routing |
| **AI vs Deterministic Boundary** | Designed the split — AI handles intent and ranking; all cart math, validation, and routing is deterministic code |
| **API Failure Handling** | Built fallback chains for Shopify timeouts and AI errors — retry logic, structured error payloads, user-facing fallback messages |
| **System Architecture** | Designed the five-layer architecture — Client, Auth, API Gateway, AI/Commerce, Persistence |
| **Deployment** | Deployed backend on Render, configured environment variables, set up CORS for Vercel frontend URL |
| **Technical Documentation** | Wrote the full Technical doc — architecture diagrams, implementation decisions, security posture, performance roadmap |

---

## 🤝 Both Together

| Area | What Was Done |
|---|---|
| **Feature Scoping** | Decided together what to build, what to defer, and what to intentionally not build |
| **End-to-End Integration** | Connected React frontend to Express backend — tested all flows from chat to checkout |
| **Decision Log** | Documented every major technical decision with reasoning and tradeoffs |
| **Full Flow Testing** | Tested login → voice query → AI response → add to cart → checkout → order success |
| **Final Presentation** | Prepared and delivered the live hackathon demo together |

---

## ⚖️ Balance Summary

| | Aarushi | Khustar |
|---|---|---|
| **Backend / Logic** | Firebase setup, AuthContext, API layer (Axios), session logic, form validation | Express server, Groq AI, Shopify GraphQL, Firebase Admin SDK, cart logic |
| **Frontend / UI** | Chat UI, Auth pages, Checkout, Cart, CSS, Voice | CartContext, CheckoutContext |
| **Architecture** | Client-side data flow, personalization engine | Server architecture, AI pipeline, deployment |
| **Docs** | Product Documentation | Technical Documentation |

> Both engineers touched **both frontend and backend concerns.**
> Aarushi owned the **client-side logic layer** (auth state, API calls, session, validation) + UI.
> Khustar owned the **server-side logic layer** (AI, Shopify, Express, Firebase Admin) + contexts.

---

## 🛠️ Tech Stack

```
Frontend    → React 18, React Router DOM, Axios, Lucide React, CSS Modules
Backend     → Node.js, Express.js
AI          → Groq API (Llama 3.1)
Commerce    → Shopify Storefront GraphQL API
Auth        → Firebase Authentication (JWT) + Firebase Admin SDK
Voice       → Web Speech API (Chrome/Edge)
Deployed    → Vercel (frontend) · Render (backend)
```

---

<div align="center">

**Built with ❤️ by Aarushi Sharma & MD. Khustar Noorani**
*KIIT Bhubaneswar · Shopify AI Shopping Hackathon 2026*

</div>
