const { chat } = require("../services/aiService");

const chatController = async (req, res) => {
  try {
    const { messages, userMessage } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "userMessage is required" });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const result = await chat(messages, userMessage);

    res.json({
      success: true,
      message: result.message,
      referencedProducts: result.referencedProducts,
      cartCommands: result.cartCommands,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process your request",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { chatController };
