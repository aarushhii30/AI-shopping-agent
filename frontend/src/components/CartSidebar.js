import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ExternalLink, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    checkout,
    isCreatingCart,
    cartError,
    totalItems,
    totalPrice,
  } = useCart();

  const formatPrice = (price, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-sidebar__header">
          <div className="cart-sidebar__title">
            <ShoppingBag size={20} />
            <span>Your Cart</span>
            {totalItems > 0 && (
              <span className="cart-count">{totalItems}</span>
            )}
          </div>
          <button className="cart-sidebar__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-sidebar__body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} />
              <p>Your cart is empty</p>
              <span>Chat with the AI assistant to find products!</span>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.variantId} className="cart-item">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="cart-item__image"
                    />
                  ) : (
                    <div className="cart-item__image-placeholder">
                      <ShoppingBag size={20} />
                    </div>
                  )}

                  <div className="cart-item__info">
                    <div className="cart-item__name">{item.title}</div>
                    {item.variantTitle && (
                      <div className="cart-item__variant">{item.variantTitle}</div>
                    )}
                    <div className="cart-item__price">
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </div>
                  </div>

                  <div className="cart-item__controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.variantId)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total__price">
                {formatPrice(totalPrice, cartItems[0]?.currency)}
              </span>
            </div>
            {cartError && (
              <div className="cart-error">{cartError}</div>
            )}
            <button
              className="checkout-btn"
              onClick={checkout}
              disabled={isCreatingCart}
            >
              {isCreatingCart ? (
                <>
                  <Loader size={16} className="spin" />
                  Creating checkout...
                </>
              ) : (
                <>
                  <ExternalLink size={16} />
                  Proceed to Checkout
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;
