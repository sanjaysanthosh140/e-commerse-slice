import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import "./Adminform.css";

const emptyVariant = () => ({
  sku: "",
  size: "",
  colour: "",
  price: "",
  stock: "",
  image: "",
});

const emptyProduct = () => ({
  title: "",
  slug: "",
  description: "",
  category: "",
  brand: "",
  images: "",
  mainPrice: "",
  maxPrice: "",
  variants: [],
});

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyProduct);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8080/admin/getcategory");
        setCategories(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch {
        setMessage("Failed to load categories.");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (name === "title" && !current.slugEdited) {
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
    const { value } = event.target;
    setFormData((current) => ({
      ...current,
      slug: value,
      slugEdited: true,
    }));
    setMessage("");
  };

  const addVariant = () => {
    setFormData((current) => ({
      ...current,
      variants: [...current.variants, emptyVariant()],
    }));
  };

  const removeVariant = (index) => {
    setFormData((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index, event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const variants = current.variants.map((variant, i) =>
        i === index ? { ...variant, [name]: value } : variant,
      );
      return { ...current, variants };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      images: formData.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
      mainPrice: formData.mainPrice,
      maxPrice: formData.maxPrice,
      variants: formData.variants,
    };

    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:8080/admin/products", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMessage(`Product "${formData.title}" added successfully.`);
      setFormData(emptyProduct());
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to save product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-form-page">
      <section className="admin-form-card admin-form-card-wide">
        <button
          type="button"
          className="admin-form-back"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Back to dashboard
        </button>
        <div className="admin-form-intro">
          <span className="admin-form-eyebrow">Catalog</span>
          <h1>Add Product</h1>
          <p>Add a new product with optional variants.</p>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="product-title">Title</label>
          <input
            id="product-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Cotton T-Shirt"
            required
          />

          <label htmlFor="product-slug">Slug</label>
          <input
            id="product-slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="e.g. cotton-t-shirt"
            required
          />

          <label htmlFor="product-description">Description</label>
          <textarea
            id="product-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product details"
            rows={4}
            required
          />

          <div className="admin-form-row">
            <div>
              <label htmlFor="product-category">Category</label>
              <select
                id="product-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product-brand">Brand</label>
              <input
                id="product-brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. MegaMart"
                required
              />
            </div>
          </div>

          <label htmlFor="product-images">Images</label>
          <input
            id="product-images"
            name="images"
            type="text"
            value={formData.images}
            onChange={handleChange}
            placeholder="Comma-separated image URLs"
            required
          />

          <div className="admin-form-row">
            <div>
              <label htmlFor="product-main-price">Main price (₹)</label>
              <input
                id="product-main-price"
                name="mainPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.mainPrice}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label htmlFor="product-max-price">Max price (₹)</label>
              <input
                id="product-max-price"
                name="maxPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxPrice}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="admin-variants">
            <div className="admin-variants-header">
              <div>
                <h2>Variants</h2>
                <p>Add size/colour variants as needed.</p>
              </div>
              <button
                type="button"
                className="admin-variant-add"
                onClick={addVariant}
                aria-label="Add variant"
              >
                +
              </button>
            </div>

            {formData.variants.length === 0 && (
              <p className="admin-variants-empty">
                No variants yet. Click + to add one.
              </p>
            )}

            {formData.variants.map((variant, index) => (
              <div key={index} className="admin-variant-block">
                <div className="admin-variant-block-header">
                  <span>Variant {index + 1}</span>
                  <button
                    type="button"
                    className="admin-variant-remove"
                    onClick={() => removeVariant(index)}
                  >
                    Remove
                  </button>
                </div>

                <div className="admin-form-row">
                  <div>
                    <label htmlFor={`variant-sku-${index}`}>SKU</label>
                    <input
                      id={`variant-sku-${index}`}
                      name="sku"
                      type="text"
                      value={variant.sku}
                      onChange={(event) => handleVariantChange(index, event)}
                      placeholder="SKU-001"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor={`variant-size-${index}`}>Size</label>
                    <input
                      id={`variant-size-${index}`}
                      name="size"
                      type="text"
                      value={variant.size}
                      onChange={(event) => handleVariantChange(index, event)}
                      placeholder="e.g. M"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div>
                    <label htmlFor={`variant-colour-${index}`}>Colour</label>
                    <input
                      id={`variant-colour-${index}`}
                      name="colour"
                      type="text"
                      value={variant.colour}
                      onChange={(event) => handleVariantChange(index, event)}
                      placeholder="e.g. Blue"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor={`variant-price-${index}`}>Price (₹)</label>
                    <input
                      id={`variant-price-${index}`}
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) => handleVariantChange(index, event)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div>
                    <label htmlFor={`variant-stock-${index}`}>Stock</label>
                    <input
                      id={`variant-stock-${index}`}
                      name="stock"
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(event) => handleVariantChange(index, event)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor={`variant-image-${index}`}>Image</label>
                    <input
                      id={`variant-image-${index}`}
                      name="image"
                      type="text"
                      value={variant.image}
                      onChange={(event) => handleVariantChange(index, event)}
                      placeholder="Image URL"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="admin-form-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Product"}
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

export default AddProduct;
