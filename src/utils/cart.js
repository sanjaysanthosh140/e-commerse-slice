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
  }));

export const getCartCount = (items = []) =>
  items.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);

export const getCartTotal = (items = []) =>
  items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.qty || item.quantity || 0),
    0,
  );

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
      message: "Please sign in",
    };
  }

  try {
    const res = await axios.get(CART_API, { headers: authHeaders() });
    const items = mapItems(res.data.items || res.data.cart?.items || []);
    return { ok: true, items, cart: res.data.cart };
  } catch (error) {
    return {
      ok: false,
      needsAuth: error.response?.status === 401,
      items: [],
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

    const items = mapItems(res.data.cart?.items || []);
    notifyCartUpdated(items);

    return {
      ok: true,
      alreadyAdded: Boolean(res.data.alreadyAdded),
      message: res.data.message || "Added to cart",
      items,
      stock: res.data.stock,
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

    const items = mapItems(res.data.cart?.items || []);
    notifyCartUpdated(items);

    return {
      ok: true,
      message: res.data.message,
      items,
      stock: res.data.stock,
      quantity: res.data.quantity,
    };
  } catch (error) {
    return {
      ok: false,
      outOfStock: Boolean(error.response?.data?.outOfStock),
      message: error.response?.data?.message || "Failed to update quantity",
      items: mapItems(error.response?.data?.cart?.items || []),
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

    const items = mapItems(res.data.cart?.items || []);
    notifyCartUpdated(items);

    return {
      ok: true,
      message: res.data.message || "Removed",
      items,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to remove item",
      items: [],
    };
  }
};
