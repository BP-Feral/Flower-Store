import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function ProtectedRoute({ children, requiredPermission }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Admin can access anything
  if (user.username === "admin") {
    return children;
  }
  
  // Otherwise check product permissions
  const hasProductPermission = user.permissions.add_product || user.permissions.edit_product || user.permissions.delete_product;
  
  if (!hasProductPermission) {
    return <Navigate to="/" />;
  }
  
  return children;
  
}

export default ProtectedRoute;
