import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Package, Truck, MapPin, ShoppingBag,
  Download, Share2, ArrowRight, Sparkles
} from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { formatPrice } from '../utils/format';
import './OrderSuccessPage.css';

const STEPS = [
  { icon: CheckCircle2, label: 'Order Confirmed',   sublabel: 'We\'ve received your order' },
  { icon: Package,      label: 'Being Packed',       sublabel: 'Your items are being packed' },
  { icon: Truck,        label: 'Out for Delivery',   sublabel: 'On its way to you' },
  { icon: MapPin,       label: 'Delivered',          sublabel: 'Enjoy your purchase!' },
];

const ConfettiPiece = ({ style }) => (
  <div className="confetti-piece" style={style} />
);

const OrderSuccessPage = () => {
  const navigate     = useNavigate();
  const { placedOrder } = useCheckout();
  const [visible, setVisible]     = useState(false);
  const [confetti, setConfetti]   = useState([]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setVisible(true), 100);

    // Generate confetti
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      key: i,
      left:  `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      backgroundColor: ['#6c63ff','#f0c060','#4ade80','#f87171','#8b84ff','#38bdf8'][
        Math.floor(Math.random() * 6)
      ],
      width:  `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      transform: `rotate(${Math.random() * 360}deg)`,
    }));
    setConfetti(pieces);
  }, []);

  if (!placedOrder) {
    return (
      <div className="success-page">
        <div className="success-page__empty">
          <ShoppingBag size={48} />
          <h2>No order found</h2>
          <button className="back-to-shop-btn" onClick={() => navigate('/')}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const { id, date, items, shipping, totalPrice, currency, estimatedDelivery } = placedOrder;

  return (
    <div className="success-page">
      {/* Confetti */}
      <div className="confetti-container">
        {confetti.map((c) => (
          <ConfettiPiece
            key={c.key}
            style={{
              left: c.left,
              animationDelay: c.animationDelay,
              animationDuration: c.animationDuration,
              backgroundColor: c.backgroundColor,
              width: c.width,
              height: c.height,
              borderRadius: c.borderRadius,
              transform: c.transform,
            }}
          />
        ))}
      </div>

      <div className={`success-page__card ${visible ? 'visible' : ''}`}>
        {/* Hero */}
        <div className="success-hero">
          <div className="success-hero__ring">
            <div className="success-hero__icon">
              <CheckCircle2 size={44} />
            </div>
          </div>
          <div className="success-hero__sparkles">
            <Sparkles size={16} className="sparkle s1" />
            <Sparkles size={12} className="sparkle s2" />
            <Sparkles size={10} className="sparkle s3" />
          </div>
          <h1 className="success-hero__title">Order Confirmed!</h1>
          <p className="success-hero__sub">
            Thank you, <strong>{shipping.firstName}</strong>! Your order is on its way.
          </p>
          <div className="success-hero__id">Order #{id}</div>
        </div>

        {/* Delivery timeline */}
        <div className="success-timeline">
          <div className="timeline-label">Delivery Status</div>
          <div className="timeline-track">
            {STEPS.map((s, i) => {
              const Icon    = s.icon;
              const active  = i === 0;
              const done    = i === 0;
              return (
                <React.Fragment key={s.label}>
                  <div className={`timeline-node ${done ? 'done' : active ? 'active' : ''}`}>
                    <div className="timeline-node__circle">
                      <Icon size={16} />
                    </div>
                    <div className="timeline-node__text">
                      <span className="timeline-node__label">{s.label}</span>
                      <span className="timeline-node__sub">{s.sublabel}</span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`timeline-connector ${done ? 'done' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="estimated-delivery">
            <Truck size={15} />
            <span>Estimated delivery: <strong>{estimatedDelivery}</strong></span>
          </div>
        </div>

        {/* Order details */}
        <div className="success-details">
          <div className="success-details__section">
            <h3>Order Items</h3>
            <div className="success-items">
              {items.map((item) => (
                <div key={item.variantId} className="success-item">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="success-item__img" />
                  )}
                  <div className="success-item__info">
                    <span className="success-item__title">{item.title}</span>
                    {item.variantTitle && (
                      <span className="success-item__variant">{item.variantTitle}</span>
                    )}
                    <span className="success-item__qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="success-item__price">
                    {formatPrice(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="success-details__cols">
            <div className="success-details__section">
              <h3>Shipping To</h3>
              <p>{shipping.firstName} {shipping.lastName}</p>
              <p>{shipping.address}</p>
              <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
              <p className="detail-muted">{shipping.email}</p>
              <p className="detail-muted">{shipping.phone}</p>
            </div>

            <div className="success-details__section">
              <h3>Order Summary</h3>
              <div className="success-totals">
                <div className="success-total-line">
                  <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>{formatPrice(totalPrice, currency)}</span>
                </div>
                <div className="success-total-line success-total-line--grand">
                  <span>Total Paid</span>
                  <span>{formatPrice(totalPrice, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="success-actions">
          <button className="success-action-btn primary" onClick={() => navigate('/')}>
            <ShoppingBag size={16} /> Continue Shopping <ArrowRight size={16} />
          </button>
          <button
            className="success-action-btn secondary"
            onClick={() => window.print()}
          >
            <Download size={16} /> Save Receipt
          </button>
          <button
            className="success-action-btn secondary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My Order', text: `Order #${id} confirmed!` });
              }
            }}
          >
            <Share2 size={16} /> Share
          </button>
        </div>

        <p className="success-footer">
          A confirmation email has been sent to <strong>{shipping.email}</strong>
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
