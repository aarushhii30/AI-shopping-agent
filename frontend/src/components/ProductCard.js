import React, { useState } from 'react';
import { ShoppingBag, Star, ExternalLink, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, compact = false }) => {
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );

  const isInCart = cartItems.some((i) => i.variantId === selectedVariant?.id);

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title !== 'Default Title' ? selectedVariant.title : '',
      price: selectedVariant.price,
      currency: product.currency,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasMultipleVariants =
    product.variants?.length > 1 &&
    product.variants[0]?.title !== 'Default Title';

  return (
    <div className={`product-card ${compact ? 'compact' : ''}`}>
      {/* Image */}
      <div className="product-card__image">
        {product.image ? (
          <img src={product.image} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card__image-placeholder">
            <ShoppingBag size={32} />
          </div>
        )}
        {!product.available && (
          <div className="product-card__badge unavailable">Out of Stock</div>
        )}
      </div>

      {/* Content */}
      <div className="product-card__content">
        {product.vendor && (
          <span className="product-card__vendor">{product.vendor}</span>
        )}
        <h3 className="product-card__title">{product.title}</h3>

        {!compact && product.description && (
          <p className="product-card__description">
            {product.description.substring(0, 120)}
            {product.description.length > 120 ? '...' : ''}
          </p>
        )}

        {/* Tags */}
        {!compact && product.tags?.length > 0 && (
          <div className="product-card__tags">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="product-card__tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Variant selector */}
        {hasMultipleVariants && (
          <div className="product-card__variants">
            <select
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const v = product.variants.find((v) => v.id === e.target.value);
                setSelectedVariant(v);
              }}
              className="product-card__variant-select"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id} disabled={!v.available}>
                  {v.title} {!v.available ? '(Out of Stock)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price + CTA */}
        <div className="product-card__footer">
          <div className="product-card__price">
            {selectedVariant ? (
              <span className="price-main">
                {formatPrice(selectedVariant.price, product.currency)}
              </span>
            ) : (
              <span className="price-main">
                {formatPrice(product.priceMin, product.currency)}
                {product.priceMax !== product.priceMin &&
                  ` – ${formatPrice(product.priceMax, product.currency)}`}
              </span>
            )}
          </div>

          <button
            className={`product-card__cta ${added ? 'added' : ''} ${!product.available || (selectedVariant && !selectedVariant.available) ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={
              !product.available ||
              (selectedVariant && !selectedVariant.available)
            }
          >
            {added ? (
              <>
                <Check size={16} />
                Added
              </>
            ) : (
              <>
                <Plus size={16} />
                {isInCart ? 'Add More' : 'Add to Cart'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
