const OpenAI = require("openai");

const {
  fetchProducts,
  formatProductsForAI,
} = require("./shopifyService");

// Groq Client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// System Prompt
const SYSTEM_PROMPT = `
You are an expert AI shopping assistant for a Shopify store.

Your responsibilities:
- Understand what the user actually needs
- Recommend the best matching products
- Stay within the user's budget
- Explain recommendations clearly
- Ask intelligent follow-up questions
- Help users confidently make purchase decisions

==============================
CRITICAL PRODUCT FORMAT RULE
==============================

Whenever you recommend or mention ANY product, you MUST ALWAYS include the product ID on a NEW LINE using EXACTLY this format:

[PRODUCT_ID: gid://shopify/Product/123456789]

CORRECT EXAMPLE:

Running Shoes
[PRODUCT_ID: gid://shopify/Product/10324739031172]

IMPORTANT RULES:
- NEVER put product names inside brackets
- NEVER change PRODUCT_ID format
- ALWAYS write PRODUCT_ID exactly
- ALWAYS place PRODUCT_ID on a separate line
- ALWAYS use real product IDs from context
- ALWAYS recommend products from the store catalog only

==============================
BUDGET RULES
==============================

- NEVER recommend products above the user's budget
- Use ACTUAL product prices from context
- If no matching product exists within budget, clearly say so
- Recommend the closest matching alternative only if appropriate

==============================
RESPONSE STYLE
==============================

- Conversational
- Helpful
- Modern ecommerce assistant tone
- Short and clean responses
- Ask only ONE follow-up question at a time
- Avoid very long paragraphs
- Explain WHY a product matches the user's needs
`;

// Parse Product References
const parseProductReferences = (text) => {
  const productRefs = [];

  const productIdRegex =
    /\[PRODUCT_ID:\s*(gid:\/\/shopify\/Product\/\d+)\]/g;

  const fallbackRegex =
    /Product ID:\s*(gid:\/\/shopify\/Product\/\d+)/g;

  let match;

  while ((match = productIdRegex.exec(text)) !== null) {
    productRefs.push(match[1]);
  }

  while ((match = fallbackRegex.exec(text)) !== null) {
    productRefs.push(match[1]);
  }

  return [...new Set(productRefs)];
};

// Parse Cart Commands
const parseCartCommands = (text) => {
  const cartItems = [];

  const cartRegex =
    /\[ADD_TO_CART:\s*(gid:\/\/shopify\/ProductVariant\/\d+)\]/g;

  let match;

  while ((match = cartRegex.exec(text)) !== null) {
    cartItems.push(match[1]);
  }

  return cartItems;
};

// Main Chat Function
const chat = async (messages, userMessage) => {
  let products = [];
  let productContext = "";

  try {
    const rawProducts = await fetchProducts("", 60);

    products = formatProductsForAI(rawProducts);

    productContext = `
CURRENT STORE PRODUCTS:

${products
  .slice(0, 30)
  .map(
  (p) => `
Title: ${p.title}
Price: ${p.priceMin} ${p.currency}
Type: ${p.type || "General"}
Available: ${p.available ? "Yes" : "No"}
Image: ${p.image}
Product ID: ${p.id}
`
)
  .join("\n")}
`;
  } catch (err) {
    console.error(
      "Failed to fetch products:",
      err.message
    );

    productContext =
      "Product catalog temporarily unavailable.";
  }

  const systemWithProducts =
    SYSTEM_PROMPT + "\n" + productContext;

  // Groq Completion
  const completion =
    await client.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content: systemWithProducts,
        },

        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),

        {
          role: "user",
          content: userMessage,
        },
      ],

      temperature: 0.2,
      max_tokens: 500,
    });

  const rawText =
    completion.choices[0].message.content;

  // Extract Product IDs
  const referencedProductIds =
    parseProductReferences(rawText);

  // Extract Cart Commands
  const cartCommands =
    parseCartCommands(rawText);

  // Clean Response
  const cleanText =
    rawText
      ?.replace(/\[PRODUCT_ID:\s*[^\]]+\]/g, "")
      ?.trim() ||
    "Here are some products you might like.";

  // Match Product Objects
  let referencedProducts = products.filter((p) =>
    referencedProductIds.includes(p.id)
  );

  // Fallback matching using user message
  if (
  referencedProducts.length === 0 &&
  products.length > 0
) {
  const lowerMsg = userMessage.toLowerCase();

  referencedProducts = products.filter((p) => {
    const title =
      p.title?.toLowerCase?.() || "";

    return (
      lowerMsg.includes(title) ||
      title.includes(lowerMsg) ||
      lowerMsg.includes("gift") ||
      lowerMsg.includes("shoe") ||
      lowerMsg.includes("bottle")
    );
  }).slice(0, 6);
}

  return {
    message: cleanText,
    referencedProducts,
    cartCommands,
    rawText,
  };
};

// Product Search
const searchProducts = async (query) => {
  let products = [];

  try {
    const rawProducts = await fetchProducts(
      query,
      20
    );

    products = formatProductsForAI(rawProducts);
  } catch (err) {
    console.error(
      "Product search error:",
      err.message
    );
  }

  return products;
};

module.exports = {
  chat,
  searchProducts,
  parseProductReferences,
};