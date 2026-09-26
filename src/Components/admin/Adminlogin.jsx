import { useState } from "react";
import { useNavigate } from "react-router";
import "./Adminlogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage("Please enter both email and password.");
      return;
    }

    navigate("/admin/dashboard");
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-intro">
          <span className="admin-login-eyebrow">Admin Panel</span>
          <h1 id="admin-login-title">MegaMart Admin</h1>
          <p>Sign in with your admin credentials to manage the store.</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@megamart.com"
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button className="admin-login-submit" type="submit">
            Sign In
          </button>

          {message && (
            <p className="admin-login-message" role="status">
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
