import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { setAuth } from "../utils/auth";
import "./Auth.css";
import "./Signup.css";

const Signup = ({ isModal = false, onSwitch, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:8080/api/sign_up",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const { token, user } = res.data || {};
      if (!token) {
        setMessage("Signup succeeded but no token was returned.");
        return;
      }

      setAuth(token, user);

      if (isModal && onClose) {
        onClose();
      } else {
        navigate("/");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Signup failed. Please try again.",
      );
    }
  };

  return (
    <main
      className={`auth-page signup-page ${isModal ? "auth-modal-page" : ""}`}
    >
      <section className="auth-card" aria-labelledby="signup-title">
        <div className="auth-intro">
          <span className="auth-eyebrow">Join MegaMart</span>
          <h1 id="signup-title">Create your account</h1>
          <p>Save your details for a quicker, easier shopping experience.</p>
        </div>

        <form
          className="auth-form"
          action="/api/sign_up"
          method="post"
          onSubmit={handleSubmit}
        >
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="signup-phone">Phone number</label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 202 918 2132"
            autoComplete="tel"
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            minLength="8"
            required
          />

          <button className="auth-submit" type="submit">
            Create account
          </button>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          {isModal ? (
            <button type="button" className="inline-action" onClick={onSwitch}>
              Sign in
            </button>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </p>
        {isModal ? (
          <button className="back-link" type="button" onClick={onClose}>
            Back to shopping
          </button>
        ) : (
          <button
            className="back-link"
            type="button"
            onClick={() => navigate("/")}
          >
            Back to shopping
          </button>
        )}
      </section>
    </main>
  );
};

export default Signup;
