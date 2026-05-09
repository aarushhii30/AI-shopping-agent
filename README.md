# 🛍️ AI Shopping Agent

A full-stack AI-powered shopping agent that helps users discover and purchase the right products from your Shopify store. Built with React, Node.js/Express, Shopify Storefront API, and Anthropic Claude AI.

---

## ✨ Features

- **Conversational AI shopping** — Claude AI understands user intent and recommends products intelligently
- **Deep intent understanding** — Asks clarifying questions instead of dumping a product list
- **Smart product matching** — Narrows options with reasoning, not just keyword search
- **Tradeoff handling** — Explicitly surfaces price vs. quality, availability vs. preference decisions
- **Explained recommendations** — Tells users *why* each product fits their needs
- **Cart management** — Add/remove items, adjust quantities
- **Shopify checkout** — Seamless redirect to Shopify's native checkout
- **Real-time product sync** — Fetches live product data from your Shopify store

---

## 📁 Project Structure

```
ai-shopping-agent/
├── backend/
│   ├── controllers/
│   │   ├── chatController.js      # Handles AI chat requests
│   │   └── productsController.js  # Handles product/cart requests
│   ├── routes/
│   │   └── api.js                 # All API routes
│   ├── services/
│   │   ├── aiService.js           # Anthropic Claude integration
│   │   └── shopifyService.js      # Shopify Storefront API
│   ├── .env.example               # Environment variables template
│   ├── package.json
│   └── server.js                  # Express server entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductCard.js     # Product display card
│   │   │   ├── ProductCard.css
│   │   │   ├── CartSidebar.js     # Sliding cart sidebar
│   │   │   └── CartSidebar.css
│   │   ├── context/
│   │   │   └── CartContext.js     # Global cart state
│   │   ├── pages/
│   │   │   ├── ChatPage.js        # Main chat interface
│   │   │   └── ChatPage.css
│   │   ├── utils/
│   │   │   └── api.js             # API utility functions
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   └── package.json
│
├── package.json                   # Root scripts for concurrent dev
└── README.md
```

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 18+
- A Shopify store with Storefront API access
- An Anthropic API key

---

### Step 1: Get Shopify Credentials

1. Go to your Shopify Admin → **Apps** → **Develop apps**
2. Create a new app (or use existing)
3. Under **API credentials**, enable the **Storefront API**
4. Add these scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
5. Copy your **Storefront API access token**
6. Your store URL format: `https://your-store-name.myshopify.com`

---

### Step 2: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy it

---

### Step 3: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
SHOPIFY_STORE_URL=https://your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_storefront_access_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

### Step 4: Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STORE_NAME=My Store
```

---

### Step 5: Install & Run

From the root directory:

```bash
# Install all dependencies
npm run install:all

# Run both backend and frontend simultaneously
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend (port 5000)
npm run dev:backend

# Terminal 2 - Frontend (port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message to AI agent |
| `GET` | `/api/products` | Fetch products (optional `?query=&limit=`) |
| `GET` | `/api/collections` | Fetch all collections |
| `POST` | `/api/cart` | Create Shopify cart & get checkout URL |
| `GET` | `/api/health` | Health check |

### Chat Request Example
```json
POST /api/chat
{
  "userMessage": "I need a gift for my partner under $50",
  "messages": [
    { "role": "assistant", "content": "Hi! What are you looking for?" }
  ]
}
```

### Cart Request Example
```json
POST /api/cart
{
  "lineItems": [
    { "variantId": "gid://shopify/ProductVariant/12345", "quantity": 1 }
  ]
}
```

---

## 🎨 Customization

### Change the AI personality
Edit the `SYSTEM_PROMPT` in `backend/services/aiService.js` to match your brand voice.

### Add product filtering
Modify `fetchProducts()` in `backend/services/shopifyService.js` to add custom Shopify search filters.

### Styling
All styles use CSS custom properties defined in `frontend/src/index.css`. Update the `:root` variables to match your brand colors.

---

## 🚢 Deployment

### Backend (Railway / Render / Heroku)
1. Set all environment variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Set `FRONTEND_URL` to your deployed frontend URL
4. Deploy with `npm start`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Run `npm run build`
3. Deploy the `build/` folder

---

## 🔐 Security Notes

- Never commit `.env` files — they're in `.gitignore`
- The Storefront API token is a **public** token (safe for client-facing apps), but keep it server-side anyway
- The Anthropic API key must stay **server-side only**
- Rate limiting is applied (100 requests / 15 minutes per IP)

---

## 📝 License

MIT
