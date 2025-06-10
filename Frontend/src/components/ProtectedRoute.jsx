import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function ProtectedRoute({ children, requiredPermission }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admin can access everything
  if (user.username === "admin") {
    return children;
  }

  // If a specific permission is required, check for it
  if (requiredPermission) {
    if (user.permissions?.[requiredPermission]) {
      return children;
    } else {
      return <Navigate to="/" />;
    }
  }

  // Otherwise check general product permission
  const hasProductPermission =
    user.permissions.adauga_produs ||
    user.permissions.modifica_produs ||
    user.permissions.sterge_produs;

  if (hasProductPermission) {
    return children;
  }

  return <Navigate to="/" />;
}

export default ProtectedRoute;
