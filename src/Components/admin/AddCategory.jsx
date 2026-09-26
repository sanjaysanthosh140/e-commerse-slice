import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import "./Adminform.css";

const emptyCategory = () => ({
  name: "",
  slug: "",
  description: "",
  image: "",
});

const AddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyCategory);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (name === "name" && !current.slugEdited) {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      return next;
    });
    setMessage("");
  };

  const handleSlugChange = (event) => {
    setFormData((current) => ({
      ...current,
      slug: event.target.value,
      slugEdited: true,
    }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image: formData.image,
    };

    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:8080/admin/category", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMessage(`Category "${formData.name}" added successfully.`);
      setFormData(emptyCategory());
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to save category. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-form-page">
      <section className="admin-form-card">
        <button
          type="button"
          className="admin-form-back"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Back to dashboard
        </button>
        <div className="admin-form-intro">
          <span className="admin-form-eyebrow">Catalog</span>
          <h1>Add Category</h1>
          <p>Create a new category to group products.</p>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="category-name">Name</label>
          <input
            id="category-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Electronics"
            required
          />

          <label htmlFor="category-slug">Slug</label>
          <input
            id="category-slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="e.g. electronics"
            required
          />

          <label htmlFor="category-description">Description</label>
          <textarea
            id="category-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Short description of this category"
            rows={4}
          />

          <label htmlFor="category-image">Image</label>
          <input
            id="category-image"
            name="image"
            type="text"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
          />

          <button
            className="admin-form-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Category"}
          </button>

          {message && (
            <p className="admin-form-message" role="status">
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
};

export default AddCategory;
