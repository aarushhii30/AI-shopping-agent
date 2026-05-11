require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}\n`);
});

module.exports = app;