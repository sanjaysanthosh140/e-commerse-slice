import { useNavigate } from "react-router";
import "./Admindashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <span className="admin-dashboard-eyebrow">Control Center</span>
          <h1>Admin Dashboard</h1>
          <p>Overview of MegaMart store activity.</p>
        </div>
        <button
          type="button"
          className="admin-dashboard-logout"
          onClick={() => navigate("/admin")}
        >
          Log out
        </button>
      </header>

      <section className="admin-dashboard-grid" aria-label="Dashboard stats">
        <article className="admin-stat">
          <span className="admin-stat-label">Orders today</span>
          <strong className="admin-stat-value">128</strong>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-label">Active products</span>
          <strong className="admin-stat-value">1,042</strong>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-label">Customers</span>
          <strong className="admin-stat-value">8,356</strong>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-label">Revenue</span>
          <strong className="admin-stat-value">₹2.4L</strong>
        </article>
      </section>

      <section className="admin-dashboard-panel">
        <h2>Manage catalog</h2>
        <p>Choose an option to update categories or products.</p>
        <div className="admin-option-grid">
          <button
            type="button"
            className="admin-option-card"
            onClick={() => navigate("/admin/add-category")}
          >
            <span className="admin-option-title">Add Category</span>
            <span className="admin-option-desc">
              Create a new product category for the store.
            </span>
          </button>
          <button
            type="button"
            className="admin-option-card"
            onClick={() => navigate("/admin/add-product")}
          >
            <span className="admin-option-title">Add Product</span>
            <span className="admin-option-desc">
              Add a new product with price, stock, and details.
            </span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
