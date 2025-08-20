
// export default ProtectedRoute;
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { isTokenExpired } from "../stores/tokenUtils";

// export default ProtectedRoute;
const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, isLoggedIn, logout, user } = useAuthStore();

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout]);

  if (!isLoggedIn || !token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;