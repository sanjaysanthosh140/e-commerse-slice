import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";
import { addToCart } from "../utils/cart";
import { openLoginModal } from "../utils/auth";
import "./ProductDetail.css";

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColour, setSelectedColour] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setStatus("");
      try {
        const res = await axios.get(
          `http://localhost:8080/admin/products/${id}`,
        );
        setProduct(res.data);

        const variants = res.data.variants || [];
        const firstInStock =
          variants.find((v) => v.stock > 0) || variants[0] || null;

        setSelectedSize(firstInStock?.size || "");
        setSelectedColour(firstInStock?.colour || "");
        setActiveImage(
          firstInStock?.image || res.data.images?.[0] || "",
        );
        setQty(1);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Failed to load product details.",
        );
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  }, [product]);

  const colours = useMemo(() => {
    if (!product?.variants) return [];
    const pool = selectedSize
      ? product.variants.filter((v) => v.size === selectedSize)
      : product.variants;
    return [...new Set(pool.map((v) => v.colour).filter(Boolean))];
  }, [product, selectedSize]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find(
        (v) => v.size === selectedSize && v.colour === selectedColour,
      ) || null
    );
  }, [product, selectedSize, selectedColour]);

  useEffect(() => {
    if (!selectedVariant) return;
    if (selectedVariant.image) {
      setActiveImage(selectedVariant.image);
    }
    setQty((current) => {
      const max = Math.max(1, selectedVariant.stock || 1);
      return Math.min(current, max);
    });
  }, [selectedVariant]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setStatus("");
    const match =
      product.variants.find(
        (v) => v.size === size && v.colour === selectedColour,
      ) || product.variants.find((v) => v.size === size);
    if (match) {
      setSelectedColour(match.colour);
    }
  };

  const handleColourSelect = (colour) => {
    setSelectedColour(colour);
    setStatus("");
  };

  const stock = selectedVariant?.stock ?? 0;
  const inStock = stock > 0;
  const displayPrice =
    selectedVariant?.price ?? product?.minPrice ?? product?.mainPrice ?? 0;
  const gallery = [
    ...(selectedVariant?.image ? [selectedVariant.image] : []),
    ...(product?.images || []),
  ].filter((src, index, arr) => src && arr.indexOf(src) === index);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setStatus("Please select size and colour.");
      return;
    }
    if (!inStock) {
      setStatus("This product is out of stock. You cannot add it to cart.");
      return;
    }

    const result = await addToCart({
      productId: product._id,
      variantId: selectedVariant._id,
      qty,
    });

    if (result.needsAuth) {
      setStatus(result.message);
      openLoginModal();
      return;
    }

    if (result.ok && typeof result.stock === "number") {
      setProduct((current) => {
        if (!current) return current;
        return {
          ...current,
          variants: current.variants.map((v) =>
            String(v._id) === String(selectedVariant._id)
              ? { ...v, stock: result.stock }
              : v,
          ),
        };
      });
    }

    setStatus(result.message);
  };

  if (loading) {
    return (
      <div className="pd-page">
        <p className="pd-status">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <p className="pd-status pd-error">{error || "Product not found."}</p>
        <Link to="/" className="pd-back">
          Back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <nav className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{product.category?.name || "Product"}</span>
        <span>/</span>
        <strong>{product.title}</strong>
      </nav>

      <div className="pd-layout">
        <div className="pd-gallery">
          <div className="pd-main-image">
            {activeImage ? (
              <img src={activeImage} alt={product.title} />
            ) : (
              <div className="pd-image-fallback">
                {product.title?.charAt(0) || "P"}
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="pd-thumbs">
              {gallery.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`pd-thumb ${activeImage === src ? "active" : ""}`}
                  onClick={() => setActiveImage(src)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          {product.brand && <p className="pd-brand">{product.brand}</p>}
          <h1 className="pd-title">{product.title}</h1>
          <p className="pd-price">{formatPrice(displayPrice)}</p>

          {product.description && (
            <p className="pd-desc">{product.description}</p>
          )}

          {sizes.length > 0 && (
            <div className="pd-option-block">
              <div className="pd-option-label">
                Size{" "}
                {selectedSize && (
                  <span className="pd-selected-value">{selectedSize}</span>
                )}
              </div>
              <div className="pd-option-row">
                {sizes.map((size) => {
                  const available = product.variants.some(
                    (v) => v.size === size && v.stock > 0,
                  );
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`pd-chip ${selectedSize === size ? "active" : ""} ${!available ? "disabled" : ""}`}
                      onClick={() => handleSizeSelect(size)}
                      disabled={!available}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {colours.length > 0 && (
            <div className="pd-option-block">
              <div className="pd-option-label">
                Colour{" "}
                {selectedColour && (
                  <span className="pd-selected-value">{selectedColour}</span>
                )}
              </div>
              <div className="pd-option-row">
                {colours.map((colour) => {
                  const match = product.variants.find(
                    (v) =>
                      v.colour === colour &&
                      (!selectedSize || v.size === selectedSize),
                  );
                  const available = Boolean(match && match.stock > 0);
                  return (
                    <button
                      key={colour}
                      type="button"
                      className={`pd-chip ${selectedColour === colour ? "active" : ""} ${!available ? "disabled" : ""}`}
                      onClick={() => handleColourSelect(colour)}
                      disabled={!available && !match}
                    >
                      {colour}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pd-stock-row">
            {selectedVariant ? (
              inStock ? (
                <span className="pd-stock in">In stock · {stock} left</span>
              ) : (
                <span className="pd-stock out">Out of stock</span>
              )
            ) : (
              <span className="pd-stock out">Select size & colour</span>
            )}
            {selectedVariant?.sku && (
              <span className="pd-sku">SKU: {selectedVariant.sku}</span>
            )}
          </div>

          <div className="pd-actions">
            <div className="pd-qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={!inStock}
              >
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQty((q) => Math.min(stock || 1, q + 1))
                }
                disabled={!inStock || qty >= stock}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="pd-add-cart"
              onClick={handleAddToCart}
              disabled={!selectedVariant || !inStock}
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {status && (
            <p
              className={`pd-feedback ${status.toLowerCase().includes("added") ? "ok" : "warn"}`}
              role="status"
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
