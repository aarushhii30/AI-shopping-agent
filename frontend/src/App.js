import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CheckoutProvider } from './context/CheckoutContext';
import ChatPage from './pages/ChatPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CheckoutProvider>
          <Routes>
            <Route path="/"         element={<ChatPage />} />
            <Route path="/cart"     element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
          </Routes>
        </CheckoutProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
