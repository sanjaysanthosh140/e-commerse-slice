import axios from "axios";
import { authHeaders, getToken } from "./auth";

const CART_API = "http://localhost:8080/api/cart";

const mapItems = (items = []) =>
  items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    title: item.title,
    size: item.size,
    colour: item.colour,
    price: item.price,
    image: item.image,
    qty: item.quantity ?? item.qty ?? 1,
    availableStock: item.availableStock,
    availability: item.availability || "ok",
    issue: item.issue || "",
    lineTotal: item.lineTotal,
  }));

const fromResponse = (data = {}) => ({
  items: mapItems(data.items || data.cart?.items || []),
  subtotal: Number(data.subtotal) || 0,
  canCheckout: Boolean(data.canCheckout),
  hasBlockingIssues: Boolean(data.hasBlockingIssues),
  message: data.message,
  cart: data.cart,
  order: data.order,
  failures: data.failures || [],
});

export const getCartCount = (items = []) =>
  items.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);

/** Prefer server subtotal when present so totals always match backend. */
export const getCartTotal = (items = [], serverSubtotal) => {
  if (typeof serverSubtotal === "number" && !Number.isNaN(serverSubtotal)) {
    return serverSubtotal;
  }
  return items
    .filter((item) => !item.availability || item.availability === "ok")
    .reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.qty || item.quantity || 0),
      0,
    );
};

const notifyCartUpdated = (items = []) => {
  window.dispatchEvent(
    new CustomEvent("cart-updated", {
      detail: { items, count: getCartCount(items) },
    }),
  );
};

export const fetchCart = async () => {
  if (!getToken()) {
    return {
      ok: false,
      needsAuth: true,
      items: [],
      subtotal: 0,
      canCheckout: false,
      message: "Please sign in",
    };
  }

  try {
    const res = await axios.get(CART_API, { headers: authHeaders() });
    return { ok: true, ...fromResponse(res.data) };
  } catch (error) {
    return {
      ok: false,
      needsAuth: error.response?.status === 401,
      items: [],
      subtotal: 0,
      canCheckout: false,
      message: error.response?.data?.message || "Failed to load cart",
    };
  }
};

export const addToCart = async ({ productId, variantId, qty = 1 }) => {
  if (!getToken()) {
    return {
      ok: false,
      needsAuth: true,
      message: "Please sign in to add items to cart",
      items: [],
    };
  }

  try {
    const res = await axios.post(
      `${CART_API}/add`,
      { productId, variantId, quantity: qty },
      { headers: authHeaders() },
    );

    const payload = fromResponse(res.data);
    notifyCartUpdated(payload.items);

    return {
      ok: true,
      alreadyAdded: Boolean(res.data.alreadyAdded),
      message: res.data.message || "Added to cart",
      stock: res.data.stock,
      ...payload,
    };
  } catch (error) {
    return {
      ok: false,
      needsAuth: error.response?.status === 401,
      outOfStock: Boolean(error.response?.data?.outOfStock),
      message: error.response?.data?.message || "Failed to add item to cart",
      items: [],
      stock: error.response?.data?.stock,
    };
  }
};

export const updateCartQty = async (productId, variantId, action) => {
  if (!getToken()) {
    return { ok: false, needsAuth: true, items: [], message: "Please sign in" };
  }

  try {
    const res = await axios.patch(
      `${CART_API}/qty`,
      { productId, variantId, action },
      { headers: authHeaders() },
    );

    const payload = fromResponse(res.data);
    notifyCartUpdated(payload.items);

    return {
      ok: true,
      message: res.data.message,
      stock: res.data.stock,
      quantity: res.data.quantity,
      ...payload,
    };
  } catch (error) {
    return {
      ok: false,
      outOfStock: Boolean(error.response?.data?.outOfStock),
      message: error.response?.data?.message || "Failed to update quantity",
      items: mapItems(error.response?.data?.items || []),
      subtotal: error.response?.data?.subtotal,
      canCheckout: error.response?.data?.canCheckout,
    };
  }
};

export const removeFromCart = async (productId, variantId) => {
  if (!getToken()) {
    return { ok: false, needsAuth: true, items: [], message: "Please sign in" };
  }

  try {
    const res = await axios.delete(`${CART_API}/item`, {
      headers: authHeaders(),
      data: { productId, variantId },
    });

    const payload = fromResponse(res.data);
    notifyCartUpdated(payload.items);

    return {
      ok: true,
      message: res.data.message || "Removed",
      ...payload,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to remove item",
      items: [],
    };
  }
};

export const checkoutCart = async () => {
  if (!getToken()) {
    return { ok: false, needsAuth: true, message: "Please sign in" };
  }

  try {
    const res = await axios.post(
      `${CART_API}/checkout`,
      {},
      { headers: authHeaders() },
    );

    const payload = fromResponse(res.data);
    notifyCartUpdated(payload.items);

    return {
      ok: true,
      message: res.data.message || "Checkout successful",
      ...payload,
    };
  } catch (error) {
    const data = error.response?.data || {};
    return {
      ok: false,
      status: error.response?.status,
      message: data.message || "Checkout failed",
      ...fromResponse(data),
    };
  }
};
