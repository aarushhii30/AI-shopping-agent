// frontend/src/utils/userSession.js

const SESSION_KEY = 'ai_shop_session';

export const getSession = () => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : {
      searchHistory: [],
      viewedProducts: [],
      preferredCategories: {}
    };
  } catch {
    return { searchHistory: [], viewedProducts: [], preferredCategories: {} };
  }
};

export const saveSearch = (query) => {
  try {
    const session = getSession();
    session.searchHistory = [
      query,
      ...session.searchHistory.filter(q => q !== query)
    ].slice(0, 10);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Could not save search:', e);
  }
};

export const saveViewedProduct = (product) => {
  try {
    const session = getSession();
    if (product.category) {
      session.preferredCategories[product.category] =
        (session.preferredCategories[product.category] || 0) + 1;
    }
    session.viewedProducts = [
      product,
      ...session.viewedProducts.filter(p => p.id !== product.id)
    ].slice(0, 20);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Could not save product:', e);
  }
};

export const getTopCategory = () => {
  try {
    const { preferredCategories } = getSession();
    if (!Object.keys(preferredCategories).length) return null;
    return Object.entries(preferredCategories)
      .sort((a, b) => b[1] - a[1])[0][0];
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};