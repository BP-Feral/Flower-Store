import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import ManageProducts from "./pages/ManageProducts";
import ScrollToTop from "./components/ScrollToTop";
import Store from "./pages/Store";
import CameraFeed from "./pages/CameraFeed";

function App() {
  
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Toaster position="bottom-center" reverseOrder={false} /> {/* Toast provider */}
        <Routes>
          <Route path="/" element={<h1>Public Storefront</h1>} />
          <Route path="/store" element={<Store />} />
          <Route path="/about" element={<h1>About This Project</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route
            path="/cameras"
            element={
              <ProtectedRoute requiredPermission="view_cameras">
                <CameraFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-products"
            element={
              <ProtectedRoute>
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredPermission="manage_users">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
