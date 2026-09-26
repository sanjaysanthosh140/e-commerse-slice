import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { isAuthenticated, openLoginModal } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());

  useEffect(() => {
    const sync = () => setLoggedIn(isAuthenticated());
    window.addEventListener("auth-updated", sync);
    return () => window.removeEventListener("auth-updated", sync);
  }, []);

  useEffect(() => {
    if (!loggedIn) openLoginModal();
  }, [loggedIn]);

  if (!loggedIn) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
