const {
  fetchProducts,
  fetchCollections,
  createCart,
  formatProductsForAI,
} = require("../services/shopifyService");

const getProducts = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    const products = await fetchProducts(query || "", parseInt(limit));
    const formatted = formatProductsForAI(products);
    res.json({ success: true, products: formatted, count: formatted.length });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      error: "Failed to fetch products",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getCollections = async (req, res) => {
  try {
    const collections = await fetchCollections();
    res.json({ success: true, collections });
  } catch (error) {
    console.error("Get collections error:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

const createCartController = async (req, res) => {
  try {
    const { lineItems } = req.body;

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "lineItems array is required" });
    }

    const cart = await createCart(lineItems);
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Create cart error:", error);
    res.status(500).json({
      error: "Failed to create cart",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { getProducts, getCollections, createCartController };
