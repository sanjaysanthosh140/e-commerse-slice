import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Concentric Decorative Background Circles */}
      <div className="circle-bg-wrapper">
        <div className="circle outer"></div>
        <div className="circle inner"></div>
      </div>

      <div className="footer-inner">
        {/* COLUMN 1: Logo, Contact Info, App Links */}
        <div className="footer-col col-brand">
          <h2 className="footer-logo">MegaMart</h2>

          <div className="contact-group">
            <h3 className="group-title">Contact Us</h3>

            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className="contact-text">
                <span>Whats App</span>
                <a href="tel:+12029182132">+1 202-918-2132</a>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="contact-text">
                <span>Call Us</span>
                <a href="tel:+12029182132">+1 202-918-2132</a>
              </div>
            </div>
          </div>

          <div className="app-download-group">
            <h3 className="group-title">Download App</h3>
            <div className="app-buttons">
              <a href="#appstore" className="app-btn">
                <svg className="app-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.1c.67-.83 1.13-1.98.99-3.13-.98.04-2.19.66-2.88 1.47-.62.73-1.17 1.91-1.02 3.03 1.1.09 2.24-.54 2.91-1.37z" />
                </svg>
                <div className="btn-text">
                  <span className="sub">DOWNLOAD ON THE</span>
                  <span className="main">App Store</span>
                </div>
              </a>

              <a href="#playstore" className="app-btn">
                <svg className="app-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.35 0 .68.12.94.34l12.42 8.5c.61.42.61 1.32 0 1.74l-12.42 8.5c-.26.22-.59.34-.94.34-.83 0-1.5-.67-1.5-1.5z" />
                </svg>
                <div className="btn-text">
                  <span className="sub">GET IT ON</span>
                  <span className="main">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Most Popular Categories */}
        <div className="footer-col col-links">
          <h3 className="col-title">Most Popular Categories</h3>
          <ul className="footer-links">
            <li><a href="#staples">Staples</a></li>
            <li><a href="#beverages">Beverages</a></li>
            <li><a href="#personal-care">Personal Care</a></li>
            <li><a href="#home-care">Home Care</a></li>
            <li><a href="#baby-care">Baby Care</a></li>
            <li><a href="#vegetables-fruits">Vegetables & Fruits</a></li>
            <li><a href="#snacks-foods">Snacks & Foods</a></li>
            <li><a href="#dairy-bakery">Dairy & Bakery</a></li>
          </ul>
        </div>

        {/* COLUMN 3: Customer Services */}
        <div className="footer-col col-links">
          <h3 className="col-title">Customer Services</h3>
          <ul className="footer-links">
            <li><a href="#about-us">About Us</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#ewaste">E-waste Policy</a></li>
            <li><a href="#cancellation">Cancellation & Return Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2022 All rights reserved. Reliance Retail Ltd.</p>
      </div>
    </footer>
  );
};

export default Footer;