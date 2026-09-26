import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  checkoutCart,
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
  const [subtotal, setSubtotal] = useState(0);
  const [canCheckout, setCanCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const applyCartResult = (result) => {
    setItems(result.items || []);
    setSubtotal(
      typeof result.subtotal === "number"
        ? result.subtotal
        : getCartTotal(result.items || []),
    );
    setCanCheckout(Boolean(result.canCheckout));
  };

  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      const result = await fetchCart();
      if (cancelled) return;
      applyCartResult(result);
      if (!result.ok && result.message) setMessage(result.message);
      else if (result.hasBlockingIssues) {
        setMessage(
          "Some items in your cart are out of stock or limited. Fix them before checkout.",
        );
      }
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
      applyCartResult(result);
      setMessage(
        result.hasBlockingIssues
          ? "Some items still need attention before checkout."
          : "",
      );
    } else {
      setMessage(result.message);
      if (result.items?.length) applyCartResult(result);
    }
    setBusyKey("");
  };

  const handleRemove = async (productId, variantId) => {
    const key = `${productId}-${variantId}`;
    if (busyKey) return;
    setBusyKey(key);

    const result = await removeFromCart(productId, variantId);
    if (result.ok) {
      applyCartResult(result);
      setMessage("");
    } else {
      setMessage(result.message);
    }
    setBusyKey("");
  };

  const handleCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    setMessage("");

    const result = await checkoutCart();
    if (result.ok) {
      applyCartResult(result);
      setOrderSuccess(result.order);
      setMessage(result.message);
    } else {
      applyCartResult(result);
      setMessage(result.message);
    }
    setCheckingOut(false);
  };

  const total = getCartTotal(items, subtotal);
  const hasIssues = items.some(
    (item) => item.availability && item.availability !== "ok",
  );

  if (loading) {
    return (
      <div className="cart-page">
        <p className="cart-subtitle">Loading cart...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Order confirmed</h1>
        <div className="cart-empty cart-success">
          <p>{message || "Checkout successful"}</p>
          <p className="cart-order-id">
            Order #{String(orderSuccess.id).slice(-8)} ·{" "}
            {formatPrice(orderSuccess.subtotal)}
          </p>
          <Link to="/" className="cart-continue">
            Continue shopping
          </Link>
        </div>
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
      {message && (
        <p
          className={`cart-banner ${hasIssues || !canCheckout ? "warn" : "ok"}`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => {
            const key = `${item.productId}-${item.variantId}`;
            const isBusy = busyKey === key;
            const stale = item.availability && item.availability !== "ok";

            return (
              <li
                key={key}
                className={`cart-item ${stale ? `stale-${item.availability}` : ""}`}
              >
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

                  {item.issue && (
                    <p className="cart-item-issue" role="alert">
                      {item.issue}
                      {typeof item.availableStock === "number" &&
                        item.availability === "limited" &&
                        ` (${item.availableStock} available)`}
                    </p>
                  )}

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
                        disabled={
                          isBusy ||
                          item.availability === "out_of_stock" ||
                          item.availability === "missing" ||
                          (typeof item.availableStock === "number" &&
                            item.qty >= item.availableStock)
                        }
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
                  {formatPrice(
                    item.availability === "ok"
                      ? item.price * item.qty
                      : 0,
                  )}
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
          <p className="cart-summary-note">
            Total is calculated on the server from in-stock items only.
          </p>
          {hasIssues && (
            <p className="cart-stock-note">
              Resolve out-of-stock or limited items before checkout.
            </p>
          )}
          <button
            type="button"
            className="cart-checkout"
            disabled={!canCheckout || checkingOut || hasIssues}
            onClick={handleCheckout}
          >
            {checkingOut ? "Checking out..." : "Checkout"}
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
