import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Plus, Minus, Trash2,
  Tag, ChevronRight, Package, ShieldCheck, RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import './CartPage.css';

const PROMO_CODES = { SAVE10: 10, FIRST20: 20, VIP30: 30 };

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, totalPrice, currency, totalItems } = useCart();
  const [promoCode, setPromoCode]   = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [removing, setRemoving]     = useState(null);

  const discount    = PROMO_CODES[promoCode] || 0;
  const discountAmt = (totalPrice * discount) / 100;

  // FIX: shipping threshold uses ₹500. If your prices are stored in rupees
  // this is correct. If stored in paise (×100), change 500 → 50000.
  const shipping  = totalPrice > 500 ? 0 : 49;
  const tax       = (totalPrice - discountAmt) * 0.18;
  const grandTotal = totalPrice - discountAmt + shipping + tax;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoCode(code);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoCode('');
    }
  };

  const handleRemove = (variantId) => {
    setRemoving(variantId);
    setTimeout(() => {
      removeFromCart(variantId);
      setRemoving(null);
    }, 350);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page__empty">
          <div className="empty-icon"><ShoppingBag size={56} /></div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <button className="btn-primary" onClick={() => navigate('/chat')}>
            <ArrowLeft size={16} /> Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-page__header">
        <button className="back-btn" onClick={() => navigate('/chat')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="cart-page__title">Your Cart</h1>
          <span className="cart-page__count">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="cart-page__body">

        {/* ── Items column ───────────────────────────────── */}
        <div className="cart-items-section">
          <div className="trust-badges">
            <span><ShieldCheck size={13} /> Secure Checkout</span>
            <span><Package size={13} /> Free shipping over ₹500</span>
            <span><RotateCcw size={13} /> Easy returns</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div
                key={item.variantId}
                className={`cart-item-row ${removing === item.variantId ? 'removing' : ''}`}
              >
                {/* Thumbnail — fixed size, never shrinks */}
                <div className="cart-item-row__image">
                  {item.image
                    ? <img src={item.image} alt={item.title} />
                    : <div className="img-placeholder"><ShoppingBag size={22} /></div>
                  }
                </div>

                {/* Info — takes remaining space, clips overflow */}
                <div className="cart-item-row__info">
                  <p className="cart-item-row__title">{item.title}</p>
                  {item.variantTitle && (
                    <span className="cart-item-row__variant">{item.variantTitle}</span>
                  )}
                  {/* Price shown under title on mobile only */}
                  <span className="cart-item-row__price-mobile">
                    {formatPrice(item.price * item.quantity, currency)}
                  </span>

                  {/* Qty controls inside info on mobile so they sit below title */}
                  <div className="cart-item-row__qty cart-item-row__qty--mobile">
                    <button
                      className="qty-ctrl"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    ><Minus size={13} /></button>
                    <span className="qty-num">{item.quantity}</span>
                    <button
                      className="qty-ctrl"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    ><Plus size={13} /></button>
                  </div>
                </div>

                {/* Qty controls — desktop only */}
                <div className="cart-item-row__qty cart-item-row__qty--desktop">
                  <button
                    className="qty-ctrl"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  ><Minus size={13} /></button>
                  <span className="qty-num">{item.quantity}</span>
                  <button
                    className="qty-ctrl"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  ><Plus size={13} /></button>
                </div>

                {/* Price — desktop only */}
                <div className="cart-item-row__price cart-item-row__price--desktop">
                  {formatPrice(item.price * item.quantity, currency)}
                </div>

                <button
                  className="cart-item-row__delete"
                  onClick={() => handleRemove(item.variantId)}
                ><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          {/* Promo */}
          <div className="promo-section">
            <div className="promo-section__icon"><Tag size={15} /></div>
            <input
              className="promo-input"
              placeholder="Promo code (try SAVE10)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
            />
            <button className="promo-btn" onClick={applyPromo}>Apply</button>
          </div>
          {promoError && <p className="promo-error">{promoError}</p>}
          {promoCode && (
            <p className="promo-success">
              🎉 {promoCode} applied — {discount}% off!
            </p>
          )}
        </div>

        {/* ── Summary panel ──────────────────────────────── */}
        <div className="cart-summary-panel">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-line discount">
                <span>Discount ({discount}%)</span>
                <span>−{formatPrice(discountAmt, currency)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? <span className="free-tag">FREE</span>
                  : formatPrice(shipping, currency)
                }
              </span>
            </div>
            <div className="summary-line">
              <span>GST (18%)</span>
              <span>{formatPrice(tax, currency)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-line total">
              <span>Total</span>
              <span>{formatPrice(grandTotal, currency)}</span>
            </div>
          </div>

          <button
            className="checkout-cta"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ChevronRight size={18} />
          </button>

          <button className="continue-btn" onClick={() => navigate('/chat')}>
            <ArrowLeft size={14} /> Continue Shopping
          </button>

          <div className="payment-icons">
            <span className="pay-icon">VISA</span>
            <span className="pay-icon">MC</span>
            <span className="pay-icon">UPI</span>
            <span className="pay-icon">PayPal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;