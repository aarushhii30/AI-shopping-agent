require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const apiRoutes = require("./routes/api");

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ── Allowed origins ───────────────────────────────────────
// Add every frontend URL that should be able to call this API.
// FRONTEND_URL in your Render env vars can be a comma-separated list,
// e.g. "https://snowy.vercel.app,https://ai-shopping-agent-o978axx9e-aarushhii30s-projects.vercel.app"
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  // Pull extra origins from the env var (comma-separated)
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
    : []),
];

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!incomingOrigin) return callback(null, true);

      // Allow any vercel.app preview URL for this project automatically
      const isVercel = /https:\/\/.*\.vercel\.app$/.test(incomingOrigin);

      if (isVercel || ALLOWED_ORIGINS.includes(incomingOrigin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked origin:", incomingOrigin);
        callback(new Error(`CORS: origin ${incomingOrigin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Routes
app.use("/api", apiRoutes);

// Root
app.get("/", (req, res) => {
  res.json({
    message: "AI Shopping Agent API",
    version: "1.0.0",
    endpoints: {
      chat: "POST /api/chat",
      products: "GET /api/products",
      collections: "GET /api/collections",
      cart: "POST /api/cart",
      health: "GET /api/health",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Shopping Agent API running on port ${PORT}`);
  console.log(`📦 Shopify Store: ${process.env.SHOPIFY_STORE_URL || "NOT SET"}`);
  console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? "CONFIGURED" : "NOT SET"}`);
  console.log(`🌐 Allowed origins: ${ALLOWED_ORIGINS.join(", ")}\n`);
});