import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CreditCard, Smartphone, Globe,
  Apple, CheckCircle2, ShieldCheck, Lock, ChevronDown,
  ChevronUp, Loader2, MapPin, User, Mail, Phone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { formatPrice, formatCardNumber, formatExpiry, generateOrderId } from '../utils/format';
import './CheckoutPage.css';

/* ── Step indicator ─────────────────────────────────────────────────────── */
const StepBar = ({ step }) => {
  const steps = ['Shipping', 'Payment', 'Review'];
  return (
    <div className="step-bar">
      {steps.map((label, i) => {
        const num   = i + 1;
        const done  = num < step;
        const active = num === step;
        return (
          <React.Fragment key={label}>
            <div className={`step-node ${done ? 'done' : active ? 'active' : ''}`}>
              <div className="step-node__circle">
                {done ? <CheckCircle2 size={14} /> : num}
              </div>
              <span className="step-node__label">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-connector ${done ? 'done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── Order summary sidebar ──────────────────────────────────────────────── */
const OrderSidebar = ({ collapsed, setCollapsed }) => {
  const { cartItems, totalPrice, currency } = useCart();
  const shipping  = totalPrice > 500 ? 0 : 49;
  const tax       = totalPrice * 0.18;
  const grandTotal = totalPrice + shipping + tax;

  return (
    <div className="order-sidebar">
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span>Order summary</span>
        <span className="sidebar-toggle__price">
          {formatPrice(grandTotal, currency)}
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </span>
      </button>

      {!collapsed && (
        <>
          <div className="sidebar-items">
            {cartItems.map((item) => (
              <div key={item.variantId} className="sidebar-item">
                <div className="sidebar-item__img-wrap">
                  {item.image
                    ? <img src={item.image} alt={item.title} />
                    : <div className="sidebar-item__img-placeholder" />
                  }
                  <span className="sidebar-item__qty">{item.quantity}</span>
                </div>
                <div className="sidebar-item__info">
                  <p className="sidebar-item__title">{item.title}</p>
                  {item.variantTitle && (
                    <span className="sidebar-item__variant">{item.variantTitle}</span>
                  )}
                </div>
                <span className="sidebar-item__price">
                  {formatPrice(item.price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-totals">
            <div className="sidebar-line">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice, currency)}</span>
            </div>
            <div className="sidebar-line">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="free-badge">FREE</span> : formatPrice(shipping, currency)}</span>
            </div>
            <div className="sidebar-line">
              <span>GST (18%)</span>
              <span>{formatPrice(tax, currency)}</span>
            </div>
            <div className="sidebar-divider" />
            <div className="sidebar-line total">
              <span>Total</span>
              <span>{formatPrice(grandTotal, currency)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


const F = ({
  label,
  field,
  placeholder,
  icon: Icon,
  type = 'text',
  half,
}) => {
  const { shippingInfo, setShippingInfo } = useCheckout();

  const set = (field) => (e) =>
    setShippingInfo((p) => ({
      ...p,
      [field]: e.target.value,
    }));

  return (
    <div className={`form-field ${half ? 'half' : ''}`}>
      <label className="form-label">
        {label}
      </label>

      <div className="form-input-wrap">
        {Icon && (
          <Icon
            size={15}
            className="form-input-icon"
          />
        )}

        <input
          type={type}
          className="form-input"
          placeholder={placeholder}
          value={shippingInfo[field] || ''}
          onChange={set(field)}
        />
      </div>
    </div>
  );
};


/* ── Shipping form ──────────────────────────────────────────────────────── */
const ShippingForm = ({ onNext }) => {
  const { shippingInfo, setShippingInfo } = useCheckout();
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setShippingInfo((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    const required = ['firstName','lastName','email','phone','address','city','state','zip'];
    required.forEach((f) => {
      if (!shippingInfo[f]?.trim()) errs[f] = 'Required';
    });
    if (shippingInfo.email && !/\S+@\S+\.\S+/.test(shippingInfo.email))
      errs.email = 'Invalid email';
    if (shippingInfo.phone && !/^\d{10,}$/.test(shippingInfo.phone.replace(/\D/g,'')))
      errs.phone = 'Invalid phone';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  

  const handleNext = () => {
  onNext();
};


  return (
    <div className="checkout-form fade-in">
      <div className="form-section">
        <div className="form-section__header">
          <User size={16} />
          <h3>Contact Information</h3>
        </div>
        <div className="form-row">
          <F label="First Name"  field="firstName"  placeholder="Arjun"   half />
          <F label="Last Name"   field="lastName"   placeholder="Sharma"  half />
        </div>
        <div className="form-row">
          <F label="Email"       field="email"  placeholder="arjun@example.com" icon={Mail} type="email" />
          <F label="Phone"       field="phone"  placeholder="+91 98765 43210"   icon={Phone} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section__header">
          <MapPin size={16} />
          <h3>Shipping Address</h3>
        </div>
        <F label="Address Line 1"  field="address"   placeholder="123, MG Road" />
        <F label="Apartment / Suite (optional)" field="apartment" placeholder="Flat 4B, Tower 2" />
        <div className="form-row">
          <F label="City"     field="city"  placeholder="Mumbai"     half />
          <F label="State"    field="state" placeholder="Maharashtra" half />
        </div>
        <div className="form-row">
          <F label="PIN Code" field="zip"     placeholder="400001" half />
          <div className="form-field half">
            <label className="form-label">Country</label>
            <div className="form-input-wrap">
              <Globe size={15} className="form-input-icon" />
              <select
                className="form-input"
                value={shippingInfo.country}
                onChange={set('country')}
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">UAE</option>
                <option value="SG">Singapore</option>
              </select>
            </div>
          </div>
        </div>
      </div>

     <button
  type="button"
  className="next-btn"
  onClick={handleNext}
>
        Continue to Payment <ArrowRight size={17} />
      </button>
    </div>
  );
};

/* ── Payment form ───────────────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  { id: 'card',   label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'upi',    label: 'UPI',                  icon: Smartphone },
  { id: 'paypal', label: 'PayPal',               icon: Globe },
  { id: 'apple',  label: 'Apple Pay',            icon: Apple },
  { id: 'google', label: 'Google Pay',           icon: Smartphone },
];

const PaymentForm = ({ onNext, onBack }) => {
  const { paymentMethod, setPaymentMethod, cardInfo, setCardInfo, upiId, setUpiId } = useCheckout();
  const [errors, setErrors] = useState({});

  const setCard = (field) => (e) => {
    let val = e.target.value;
    if (field === 'number') val = formatCardNumber(val);
    if (field === 'expiry') val = formatExpiry(val);
    if (field === 'cvv')    val = val.replace(/\D/g,'').substring(0, 4);
    setCardInfo((p) => ({ ...p, [field]: val }));
  };

  const validate = () => {
    const errs = {};
    if (paymentMethod === 'card') {
      const digits = cardInfo.number?.replace(/\s/g,'');
      if (!digits || digits.length < 13) errs.number = 'Invalid card number';
      if (!cardInfo.name?.trim()) errs.name = 'Required';
      if (!cardInfo.expiry || cardInfo.expiry.length < 5) errs.expiry = 'Invalid expiry';
      if (!cardInfo.cvv || cardInfo.cvv.length < 3) errs.cvv = 'Invalid CVV';
    }
    if (paymentMethod === 'upi') {
      if (!upiId?.trim() || !upiId.includes('@')) errs.upi = 'Invalid UPI ID (e.g. name@upi)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <div className="checkout-form fade-in">
      <div className="form-section">
        <div className="form-section__header">
          <CreditCard size={16} />
          <h3>Payment Method</h3>
        </div>

        <div className="payment-methods">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
           <button
  type="button"
  key={id}
  className={`payment-method-btn ${paymentMethod === id ? 'selected' : ''}`}
  onClick={() => setPaymentMethod(id)}
>
              <Icon size={18} />
              <span>{label}</span>
              {paymentMethod === id && (
                <CheckCircle2 size={16} className="pm-check" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Card fields */}
      {paymentMethod === 'card' && (
        <div className="form-section fade-in">
          <div className="card-preview">
            <div className="card-preview__chip" />
            <div className="card-preview__number">
              {(cardInfo.number || '•••• •••• •••• ••••').padEnd(19, '•')}
            </div>
            <div className="card-preview__row">
              <div>
                <div className="card-preview__sub">Card Holder</div>
                <div className="card-preview__val">
                  {cardInfo.name || 'YOUR NAME'}
                </div>
              </div>
              <div>
                <div className="card-preview__sub">Expires</div>
                <div className="card-preview__val">
                  {cardInfo.expiry || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className={`form-field ${errors.number ? 'has-error' : ''}`}>
              <label className="form-label">Card Number</label>
              <div className="form-input-wrap">
                <CreditCard size={15} className="form-input-icon" />
                <input
                  className="form-input"
                  placeholder="1234 5678 9012 3456"
                  value={cardInfo.number}
                  onChange={setCard('number')}
                  maxLength={19}
                />
              </div>
              {errors.number && <span className="form-error">{errors.number}</span>}
            </div>
          </div>

          <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
            <label className="form-label">Name on Card</label>
            <input
              className="form-input"
              placeholder="Arjun Sharma"
              value={cardInfo.name}
              onChange={setCard('name')}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className={`form-field half ${errors.expiry ? 'has-error' : ''}`}>
              <label className="form-label">Expiry Date</label>
              <input
                className="form-input"
                placeholder="MM/YY"
                value={cardInfo.expiry}
                onChange={setCard('expiry')}
                maxLength={5}
              />
              {errors.expiry && <span className="form-error">{errors.expiry}</span>}
            </div>
            <div className={`form-field half ${errors.cvv ? 'has-error' : ''}`}>
              <label className="form-label">CVV</label>
              <div className="form-input-wrap">
                <Lock size={15} className="form-input-icon" />
                <input
                  className="form-input"
                  placeholder="•••"
                  value={cardInfo.cvv}
                  onChange={setCard('cvv')}
                  maxLength={4}
                  type="password"
                />
              </div>
              {errors.cvv && <span className="form-error">{errors.cvv}</span>}
            </div>
          </div>
        </div>
      )}

      {/* UPI */}
      {paymentMethod === 'upi' && (
        <div className="form-section fade-in">
          <div className="upi-logos">
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
              <div key={app} className="upi-app">{app}</div>
            ))}
          </div>
          <div className={`form-field ${errors.upi ? 'has-error' : ''}`}>
            <label className="form-label">UPI ID</label>
            <div className="form-input-wrap">
              <Smartphone size={15} className="form-input-icon" />
              <input
                className="form-input"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
            {errors.upi && <span className="form-error">{errors.upi}</span>}
          </div>
          <p className="upi-hint">A payment request will be sent to your UPI app</p>
        </div>
      )}

      {/* PayPal / Apple / Google */}
      {['paypal','apple','google'].includes(paymentMethod) && (
        <div className="form-section fade-in">
          <div className="express-pay-info">
            <div className="express-pay-icon">
              {paymentMethod === 'paypal' && <Globe size={32} />}
              {paymentMethod === 'apple'  && <Apple size={32} />}
              {paymentMethod === 'google' && <Smartphone size={32} />}
            </div>
            <p>
              You'll be prompted to authenticate with{' '}
              <strong>
                {paymentMethod === 'paypal' ? 'PayPal'
                  : paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}
              </strong>{' '}
              when you place your order.
            </p>
          </div>
        </div>
      )}

      <div className="checkout-nav">
       <button
  type="button"
  className="back-ghost-btn"
  onClick={onBack}
>
          <ArrowLeft size={16} /> Back
        </button>
      <button
  type="button"
  className="next-btn"
  onClick={handleNext}
>
          Review Order <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
};

/* ── Review step ────────────────────────────────────────────────────────── */
const ReviewStep = ({ onBack, onPlace, placing }) => {
  const { shippingInfo, paymentMethod, cardInfo, upiId } = useCheckout();
  const { cartItems, totalPrice, currency } = useCart();
  const shipping   = totalPrice > 500 ? 0 : 49;
  const tax        = totalPrice * 0.18;
  const grandTotal = totalPrice + shipping + tax;

  const payLabel = () => {
    if (paymentMethod === 'card')
      return `Card ending in ${(cardInfo.number || '').replace(/\s/g,'').slice(-4) || '••••'}`;
    if (paymentMethod === 'upi')    return `UPI — ${upiId}`;
    if (paymentMethod === 'paypal') return 'PayPal';
    if (paymentMethod === 'apple')  return 'Apple Pay';
    if (paymentMethod === 'google') return 'Google Pay';
    return paymentMethod;
  };

  return (
    <div className="checkout-form fade-in">
      {/* Shipping review */}
      <div className="review-block">
        <div className="review-block__header">
          <MapPin size={14} />
          <span>Shipping to</span>
        </div>
        <p className="review-block__primary">
          {shippingInfo.firstName} {shippingInfo.lastName}
        </p>
        <p className="review-block__secondary">
          {shippingInfo.address}{shippingInfo.apartment ? `, ${shippingInfo.apartment}` : ''}
        </p>
        <p className="review-block__secondary">
          {shippingInfo.city}, {shippingInfo.state} — {shippingInfo.zip}
        </p>
        <p className="review-block__secondary">{shippingInfo.email} · {shippingInfo.phone}</p>
      </div>

      {/* Payment review */}
      <div className="review-block">
        <div className="review-block__header">
          <CreditCard size={14} />
          <span>Payment</span>
        </div>
        <p className="review-block__primary">{payLabel()}</p>
      </div>

      {/* Items */}
      <div className="review-block">
        <div className="review-block__header">
          <CheckCircle2 size={14} />
          <span>Items ({cartItems.length})</span>
        </div>
        {cartItems.map((item) => (
          <div key={item.variantId} className="review-item">
            {item.image && (
              <img src={item.image} alt={item.title} className="review-item__img" />
            )}
            <div className="review-item__info">
              <span className="review-item__title">{item.title}</span>
              <span className="review-item__qty">× {item.quantity}</span>
            </div>
            <span className="review-item__price">
              {formatPrice(item.price * item.quantity, currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="review-total">
        <span>Total to pay</span>
        <span className="review-total__amount">{formatPrice(grandTotal, currency)}</span>
      </div>

      <div className="secure-note">
        <ShieldCheck size={13} />
        <span>Your payment is encrypted and 100% secure</span>
      </div>

      <div className="checkout-nav">
       <button
  type="button"
  className="back-ghost-btn"
  onClick={onBack}
  disabled={placing}
>
          <ArrowLeft size={16} /> Back
        </button>
     <button
  type="button"
  className="place-order-btn"
  onClick={onPlace}
  disabled={placing}
>
          {placing
            ? <><Loader2 size={17} className="spin" /> Processing…</>
            : <><Lock size={16} /> Place Order</>
          }
        </button>
      </div>
    </div>
  );
};

/* ── Main CheckoutPage ───────────────────────────────────────────────────── */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { step, setStep, shippingInfo, paymentMethod, cardInfo, upiId, setPlacedOrder } = useCheckout();
  const { cartItems, totalPrice, currency, clearCart } = useCart();
  const [collapsed, setCollapsed] = useState(true);
  const [placing, setPlacing]     = useState(false);

  const shipping   = totalPrice > 500 ? 0 : 49;
  const tax        = totalPrice * 0.18;
  const grandTotal = totalPrice + shipping + tax;

  const handlePlace = async () => {
    setPlacing(true);
    // Simulate payment processing
    await new Promise((res) => setTimeout(res, 2200));

    const order = {
      id:          generateOrderId(),
      date:        new Date().toISOString(),
      items:       cartItems,
      shipping:    shippingInfo,
      paymentMethod,
      totalPrice:  grandTotal,
      currency,
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long'
      }),
    };

    setPlacedOrder(order);
    clearCart();
    setStep(1);
    navigate('/order-success');
  };

  if (cartItems.length === 0 && step !== 3) {
    navigate('/cart');
    return null;
  }

  const stepTitle = ['', 'Shipping Information', 'Payment Details', 'Review & Confirm'][step];

  return (
    <div className="checkout-page">
      {/* Left column */}
      <div className="checkout-page__main">
        <div className="checkout-page__top">
        <button
  type="button"
  className="back-btn"
  onClick={() => step === 1 ? navigate('/cart') : setStep(step - 1)}
>
            <ArrowLeft size={18} />
          </button>
          <div className="checkout-brand">
            <span className="checkout-brand__logo">🛍️</span>
            <span className="checkout-brand__name">AI Shopping</span>
          </div>
        </div>

        <StepBar step={step} />

        <div className="checkout-page__content">
          <h2 className="checkout-step-title">{stepTitle}</h2>

          {step === 1 && <ShippingForm onNext={() => setStep(2)} />}
          {step === 2 && <PaymentForm  onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <ReviewStep
              onBack={() => setStep(2)}
              onPlace={handlePlace}
              placing={placing}
            />
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="checkout-page__sidebar">
        <OrderSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
    </div>
  );
};

export default CheckoutPage;
