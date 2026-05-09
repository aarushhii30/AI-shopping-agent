const express = require("express");
const router = express.Router();
const { chatController } = require("../controllers/chatController");
const {
  getProducts,
  getCollections,
  createCartController,
} = require("../controllers/productsController");

// Chat routes
router.post("/chat", chatController);

// Product routes
router.get("/products", getProducts);
router.get("/collections", getCollections);

// Cart routes
router.post("/cart", createCartController);

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    shopify: !!process.env.SHOPIFY_STORE_URL,
    ai: !!process.env.ANTHROPIC_API_KEY,
  });
});

module.exports = router;
