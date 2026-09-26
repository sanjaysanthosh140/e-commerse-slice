import "./App.css";
import { useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router";
import Header from "./Components/Header";
import Hero from "./Components/Hero";
import Footer from "./Components/Footer";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ProductDetail from "./Pages/ProductDetail";
import Cart from "./Pages/Cart";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminLogin from "./Components/admin/Adminlogin";
import AdminDashboard from "./Components/admin/Admindashboard";
import AddCategory from "./Components/admin/AddCategory";
import AddProduct from "./Components/admin/AddProduct";

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = pathname.startsWith("/admin");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    price: "",
    size: "",
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (pathname !== "/") {
      navigate("/");
    }
  };

  const handleSearchFiltersChange = (filters) => {
    setSearchFilters(filters);
    if (pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <>
      {!isAdminRoute && (
        <Header
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          searchFilters={searchFilters}
          onSearchFiltersChange={handleSearchFiltersChange}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <Hero
              selectedCategory={selectedCategory}
              searchFilters={searchFilters}
            />
          }
        />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-category" element={<AddCategory />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
