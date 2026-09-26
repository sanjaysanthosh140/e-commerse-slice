import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import "./Hero.css";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getProductPrice = (product) =>
  product.mainPrice ?? product.minPrice ?? 0;

const getDiscount = (mainPrice, maxPrice) => {
  const main = Number(mainPrice) || 0;
  const max = Number(maxPrice) || 0;
  if (max <= main || max <= 0) {
    return { discount: "", save: "" };
  }
  const saveAmount = max - main;
  const percent = Math.round((saveAmount / max) * 100);
  return {
    discount: `${percent}% OFF`,
    save: `Save - ₹${saveAmount.toLocaleString("en-IN")}`,
  };
};

const SLIDE_THEMES = [
  "theme-ocean",
  "theme-fresh",
  "theme-sunset",
  "theme-slate",
  "theme-mint",
];

const Hero = ({ selectedCategory, searchFilters = {} }) => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchQuery = searchFilters.search || "";
  const priceQuery = searchFilters.price || "";
  const sizeQuery = searchFilters.size || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8080/admin/getcategory");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();

        const categoryKey =
          selectedCategory?.slug ||
          selectedCategory?.name ||
          selectedCategory?._id ||
          "";

        if (categoryKey) params.set("category", categoryKey);
        if (searchQuery) params.set("search", searchQuery);
        if (priceQuery) params.set("price", priceQuery);
        if (sizeQuery) params.set("size", sizeQuery);

        const query = params.toString();
        const url = query
          ? `http://localhost:8080/admin/products?${query}`
          : "http://localhost:8080/admin/products";

        const res = await axios.get(url);
        setProducts(Array.isArray(res.data) ? res.data : []);
        setActiveSlide(0);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, priceQuery, sizeQuery]);

  const slides = selectedCategory
    ? [
        {
          id: selectedCategory._id || selectedCategory.slug,
          subtitle: "Best deals from MegaMart",
          title: selectedCategory.name,
          description:
            selectedCategory.description ||
            `Explore top picks in ${selectedCategory.name}`,
          offer: "UP to 80% OFF",
          image: selectedCategory.image || "",
          theme: "theme-ocean",
        },
      ]
    : categories.length > 0
      ? categories.map((category, index) => ({
          id: category._id || category.slug || index,
          subtitle: "Best deals from MegaMart",
          title: category.name,
          description:
            category.description || `Explore top picks in ${category.name}`,
          offer: "UP to 80% OFF",
          image: category.image || "",
          theme: SLIDE_THEMES[index % SLIDE_THEMES.length],
        }))
      : [
          {
            id: "fallback",
            subtitle: "Best deals from MegaMart",
            title: "SHOP FRESH DEALS",
            description: "Discover everyday essentials at great prices",
            offer: "UP to 80% OFF",
            image: products[0]?.images?.[0] || "",
            theme: "theme-ocean",
          },
        ];

  const slideCount = slides.length;

  useEffect(() => {
    if (paused || slideCount <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, 4000);

    return () => clearInterval(timer);
  }, [paused, slideCount]);

  const goPrev = () => {
    setActiveSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveSlide((prev) => (prev + 1) % slideCount);
  };

  const currentSlide = slides[activeSlide] || slides[0];

  const productCards = products.map((product, index) => {
    const mainPrice = getProductPrice(product);
    const { discount, save } = getDiscount(mainPrice, product.maxPrice);
    return {
      id: product._id || product.slug || index,
      name: product.title,
      price: formatPrice(mainPrice),
      originalPrice: formatPrice(product.maxPrice),
      save,
      discount,
      image: product.images?.[0] || "",
      active: index === 0,
    };
  });

  const variantCards = products.flatMap((product) =>
    (product.variants || []).map((variant, index) => ({
      id: variant._id || `${product._id}-${variant.sku}-${index}`,
      name: variant.sku || product.title,
      price: formatPrice(variant.price),
      image: variant.image || product.images?.[0] || "",
    })),
  );

  const brandCards = [...new Set(products.map((p) => p.brand).filter(Boolean))]
    .slice(0, 3)
    .map((brand, index) => {
      const match = products.find((p) => p.brand === brand);
      return {
        brand,
        image: match?.images?.[0] || "",
        offer: "UP to 80% OFF",
        tone: ["dark-card", "yellow-card", "orange-card"][index % 3],
      };
    });

  const sectionLabel = searchQuery
    ? `Results for "${searchQuery}"`
    : selectedCategory?.name || "Products";

  return (
    <div className="hero-container">
      <section
        className="hero-banner-section"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          className="carousel-arrow left"
          aria-label="Previous slide"
          onClick={goPrev}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          key={currentSlide?.id}
          className={`main-banner ${currentSlide?.theme || "theme-ocean"} banner-animate`}
        >
          <div className="banner-glow" aria-hidden="true" />
          <div className="banner-content">
            <p className="banner-subtitle">{currentSlide?.subtitle}</p>
            <h1 className="banner-title">{currentSlide?.title}</h1>
            <p className="banner-desc">{currentSlide?.description}</p>
            <p className="banner-offer">{currentSlide?.offer}</p>

            <div className="banner-dots">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`dot ${activeSlide === idx ? "active" : ""}`}
                  aria-label={`Go to ${slide.title}`}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          </div>

          <div className="banner-image-wrapper">
            {currentSlide?.image ? (
              <img src={currentSlide.image} alt={currentSlide.title} />
            ) : (
              <div className="banner-image-fallback">
                {currentSlide?.title?.charAt(0) || "M"}
              </div>
            )}
          </div>
        </div>

        <button
          className="carousel-arrow right"
          aria-label="Next slide"
          onClick={goNext}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </section>

      <section className="section-block">
        <div className="section-header">
          <h2>
            Grab the best deal on{" "}
            <span className="highlight">{sectionLabel}</span>
          </h2>
          <a href="#all-products" className="view-all">
            View All
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>

        {loading && <p className="hero-status">Loading products...</p>}
        {error && <p className="hero-status hero-status-error">{error}</p>}

        {!loading && !error && productCards.length === 0 && (
          <p className="hero-status">
            {searchQuery || priceQuery || sizeQuery
              ? "No products match your search filters."
              : selectedCategory
                ? `No products found in ${selectedCategory.name}.`
                : "No products found."}
          </p>
        )}

        <div className="products-grid">
          {productCards.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`product-card ${item.active ? "active-border" : ""}`}
              onClick={() => navigate(`/product/${item.id}`)}
            >
              {item.discount && (
                <div className="badge-discount">{item.discount}</div>
              )}
              <div className="product-image-box">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="product-info">
                <h3 className="product-title">{item.name}</h3>
                <div className="price-row">
                  <span className="current-price">{item.price}</span>
                  <span className="original-price">{item.originalPrice}</span>
                </div>
                {item.save && <div className="save-tag">{item.save}</div>}
              </div>
            </button>
          ))}
        </div>
      </section>

      {variantCards.length > 0 && (
        <section className="section-block">
          <div className="section-header">
            <h2>
              Shop From <span className="highlight">Variants</span>
            </h2>
          </div>

          <div className="categories-flex">
            {variantCards.map((variant) => (
              <div key={variant.id} className="category-item">
                <div className="category-circle">
                  <img src={variant.image} alt={variant.name} />
                </div>
                <span className="category-name">{variant.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {brandCards.length > 0 && (
        <section className="section-block">
          <div className="section-header">
            <h2>
              Top <span className="highlight">Brands</span>
            </h2>
          </div>

          <div className="brands-grid">
            {brandCards.map((item) => (
              <div key={item.brand} className={`brand-card ${item.tone}`}>
                <div className="brand-content">
                  <span className="brand-chip light">{item.brand}</span>
                  <div className="brand-badge yellow-badge">{item.brand}</div>
                  <p className="brand-offer dark-text">{item.offer}</p>
                </div>
                <div className="brand-image">
                  <img src={item.image} alt={item.brand} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {variantCards.length > 0 && (
        <section className="section-block">
          <div className="section-header">
            <h2>
              Daily <span className="highlight">Essentials</span>
            </h2>
          </div>

          <div className="essentials-grid">
            {variantCards.map((item, idx) => (
              <div
                key={`essential-${item.id}`}
                className={`essential-card ${idx === 0 ? "active-border" : ""}`}
              >
                <div className="essential-image-box">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="essential-info">
                  <p className="essential-name">{item.name}</p>
                  <h4 className="essential-offer">{item.price}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Hero;
