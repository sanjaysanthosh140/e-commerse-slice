import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { setAuth } from "../utils/auth";
import "./Auth.css";
import "./Login.css";

const Login = ({ isModal = false, onSwitch, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
        "http://localhost:8080/api/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const { token, user } = res.data || {};
      if (!token) {
        setMessage("Login succeeded but no token was returned.");
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
        error.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <main
      className={`auth-page login-page ${isModal ? "auth-modal-page" : ""}`}
    >
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-intro">
          <span className="auth-eyebrow">Welcome back</span>
          <h1 id="login-title">Sign in to MegaMart</h1>
          <p>Access your orders, saved items, and faster checkout.</p>
        </div>

        <form
          className="auth-form"
          action="/api/login"
          method="post"
          onSubmit={handleSubmit}
        >
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <div className="label-row">
            <label htmlFor="login-password">Password</label>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setMessage(
                  "Password reset instructions will be sent to your email.",
                )
              }
            >
              Reset password
            </button>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button className="auth-submit" type="submit">
            Sign In
          </button>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
        </form>

        <p className="auth-switch">
          New to MegaMart?{" "}
          {isModal ? (
            <button type="button" className="inline-action" onClick={onSwitch}>
              Create an account
            </button>
          ) : (
            <Link to="/signup">Create an account</Link>
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

export default Login;
