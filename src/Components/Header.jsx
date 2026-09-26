import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import "./Header.css";
import Login from "../Pages/Login";
import Signup from "../Pages/Signup";
import {
  clearAuth,
  getUser,
  isAuthenticated,
  openLoginModal,
} from "../utils/auth";
import { fetchCart, getCartCount } from "../utils/cart";

const Header = ({
  selectedCategory,
  onCategorySelect,
  searchFilters,
  onSearchFiltersChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(() => getUser());
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchFilters?.search || "");
  const [price, setPrice] = useState(searchFilters?.price || "");
  const [size, setSize] = useState(searchFilters?.size || "");
  const filterRef = useRef(null);
  const debounceRef = useRef(null);

  const syncCartCount = async (event) => {
    if (typeof event?.detail?.count === "number") {
      setCartCount(event.detail.count);
      return;
    }
    if (!isAuthenticated()) {
      setCartCount(0);
      return;
    }
    const result = await fetchCart();
    setCartCount(getCartCount(result.items || []));
  };

  useEffect(() => {
    const syncAuth = () => {
      setUser(getUser());
      setLoggedIn(isAuthenticated());
      syncCartCount();
    };
    const openAuth = () => setAuthMode("login");

    window.addEventListener("auth-updated", syncAuth);
    window.addEventListener("open-auth", openAuth);
    window.addEventListener("cart-updated", syncCartCount);
    syncCartCount();

    return () => {
      window.removeEventListener("auth-updated", syncAuth);
      window.removeEventListener("open-auth", openAuth);
      window.removeEventListener("cart-updated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8080/admin/getcategory");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  const handleCartClick = (event) => {
    if (!isAuthenticated()) {
      event.preventDefault();
      openLoginModal();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emitFilters = (next) => {
    onSearchFiltersChange?.({
      search: next.search ?? searchText,
      price: next.price ?? price,
      size: next.size ?? size,
    });
  };

  const handleSearchChange = (value) => {
    setSearchText(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      emitFilters({ search: value.trim() });
    }, 350);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    emitFilters({ search: searchText.trim(), price, size });
    setFilterOpen(false);
  };

  const handleApplyFilters = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    emitFilters({ search: searchText.trim(), price, size });
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setPrice("");
    setSize("");
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    emitFilters({ search: searchText.trim(), price: "", size: "" });
  };

  const hasActiveFilters = Boolean(price || size);

  return (
    <header className="header-container">
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="top-left">
            <span>Welcome to worldwide Megamart!</span>
          </div>
          <div className="top-right">
            <div className="top-item">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                Deliver to <strong>423651</strong>
              </span>
            </div>
            <div className="divider"></div>
            <div className="top-item">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Track your order</span>
            </div>
            <div className="divider"></div>
            <div className="top-item">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z" />
                <line x1="9" y1="15" x2="15" y2="9" />
              </svg>
              <span>All Offers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-header">
        <div className="main-header-inner">
          <div className="logo-group">
            <button
              className="menu-icon-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="15" y2="12" />
                <line x1="3" y1="18" x2="9" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className="logo-text"
              onClick={() => onCategorySelect?.(null)}
            >
              MegaMart
            </button>
          </div>

          <div className="search-container" ref={filterRef}>
            <form className="search-box" onSubmit={handleSearchSubmit}>
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search essentials, groceries and more..."
                aria-label="Search products"
              />
              <button
                type="button"
                className={`search-list-btn ${hasActiveFilters ? "active" : ""}`}
                aria-label="Search filter options"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((open) => !open)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </form>

            {filterOpen && (
              <div className="search-filter-panel" role="dialog" aria-label="Filter products">
                <label className="filter-field">
                  <span>Price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </label>
                <label className="filter-field">
                  <span>Size</span>
                  <input
                    type="text"
                    placeholder="e.g. M, L, 42"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </label>
                <div className="filter-actions">
                  <button type="button" className="filter-clear" onClick={handleClearFilters}>
                    Clear
                  </button>
                  <button type="button" className="filter-apply" onClick={handleApplyFilters}>
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="header-actions">
            {loggedIn ? (
              <>
                <span className="action-item action-text">
                  Hi, {user?.name || "User"}
                </span>
                <button
                  type="button"
                  className="action-item action-button"
                  onClick={() => clearAuth()}
                >
                  <span className="action-text">Logout</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="action-item action-button"
                onClick={() => setAuthMode("login")}
              >
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="action-text">Sign Up/Sign In</span>
              </button>
            )}

            <div className="action-divider"></div>

            <Link
              to="/cart"
              className="action-item"
              onClick={handleCartClick}
            >
              <svg
                className="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="action-text">
                Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <nav className={`category-bar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="category-bar-inner">
          <button
            type="button"
            className={`category-pill ${!selectedCategory ? "active" : ""}`}
            onClick={() => onCategorySelect?.(null)}
          >
            <span>All</span>
          </button>
          {categories.map((cat) => {
            const isActive =
              selectedCategory?._id === cat._id ||
              selectedCategory?.slug === cat.slug;
            return (
              <button
                key={cat._id || cat.slug}
                type="button"
                className={`category-pill ${isActive ? "active" : ""}`}
                onClick={() => onCategorySelect?.(cat)}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {authMode && (
        <div
          className="auth-modal-backdrop"
          role="presentation"
          onMouseDown={() => setAuthMode(null)}
        >
          <div
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Account access"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close account form"
              onClick={() => setAuthMode(null)}
            >
              &times;
            </button>
            <div className="auth-modal-tabs" role="tablist" aria-label="Account form">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={authMode === "signup" ? "active" : ""}
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
            </div>
            {authMode === "login" ? (
              <Login
                isModal
                onSwitch={() => setAuthMode("signup")}
                onClose={() => setAuthMode(null)}
              />
            ) : (
              <Signup
                isModal
                onSwitch={() => setAuthMode("login")}
                onClose={() => setAuthMode(null)}
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
