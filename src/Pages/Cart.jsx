import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  fetchCart,
  getCartTotal,
  removeFromCart,
  updateCartQty,
} from "../utils/cart";
import "./Cart.css";

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyKey, setBusyKey] = useState("");

  // Load once on mount — do not refetch on cart-updated (that caused the reload flash)
  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      const result = await fetchCart();
      if (cancelled) return;
      setItems(result.items || []);
      if (!result.ok && result.message) setMessage(result.message);
      setLoading(false);
    };

    loadCart();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleQty = async (productId, variantId, action) => {
    const key = `${productId}-${variantId}`;
    if (busyKey) return;
    setBusyKey(key);

    const result = await updateCartQty(productId, variantId, action);
    if (result.ok) {
      setItems(result.items);
      setMessage("");
    } else {
      setMessage(result.message);
      if (result.items?.length) setItems(result.items);
    }
    setBusyKey("");
  };

  const handleRemove = async (productId, variantId) => {
    const key = `${productId}-${variantId}`;
    if (busyKey) return;
    setBusyKey(key);

    const result = await removeFromCart(productId, variantId);
    if (result.ok) {
      setItems(result.items);
      setMessage("");
    } else {
      setMessage(result.message);
    }
    setBusyKey("");
  };

  const total = getCartTotal(items);

  if (loading) {
    return (
      <div className="cart-page">
        <p className="cart-subtitle">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Your Cart</h1>
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="cart-continue">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>
      <p className="cart-subtitle">
        {items.length} item{items.length === 1 ? "" : "s"} in your bag
      </p>
      {message && <p className="cart-stock-note">{message}</p>}

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => {
            const key = `${item.productId}-${item.variantId}`;
            const isBusy = busyKey === key;

            return (
              <li key={key} className="cart-item">
                <Link
                  to={`/product/${item.productId}`}
                  className="cart-item-image"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <span>{item.title?.charAt(0) || "P"}</span>
                  )}
                </Link>

                <div className="cart-item-info">
                  <Link
                    to={`/product/${item.productId}`}
                    className="cart-item-title"
                  >
                    {item.title}
                  </Link>
                  <p className="cart-item-meta">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.colour && <span>Colour: {item.colour}</span>}
                  </p>
                  <p className="cart-item-price">{formatPrice(item.price)}</p>

                  <div className="cart-item-actions">
                    <div className="cart-qty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={isBusy}
                        onClick={() =>
                          handleQty(
                            item.productId,
                            item.variantId,
                            "decrement",
                          )
                        }
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={isBusy}
                        onClick={() =>
                          handleQty(
                            item.productId,
                            item.variantId,
                            "increment",
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove"
                      disabled={isBusy}
                      onClick={() =>
                        handleRemove(item.productId, item.variantId)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-line-total">
                  {formatPrice(item.price * item.qty)}
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div className="cart-summary-row muted">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button type="button" className="cart-checkout" disabled>
            Checkout (coming soon)
          </button>
          <Link to="/" className="cart-continue">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
