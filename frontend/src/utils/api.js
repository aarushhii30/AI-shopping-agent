const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const apiChat = async (messages, userMessage) => {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userMessage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Chat request failed');
  }
  return res.json();
};

export const apiGetProducts = async (query = '', limit = 20) => {
  const params = new URLSearchParams({ limit });
  if (query) params.append('query', query);
  const res = await fetch(`${API_BASE}/products?${params}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

export const apiGetCollections = async () => {
  const res = await fetch(`${API_BASE}/collections`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
};

export const apiCreateCart = async (lineItems) => {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lineItems }),
  });
  if (!res.ok) throw new Error('Failed to create cart');
  return res.json();
};

export const apiHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
};
