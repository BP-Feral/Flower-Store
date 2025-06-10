import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Navbar from "./components/Navbar.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ManageProducts from "./pages/ManageProducts.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Store from "./pages/Store.jsx";
import CameraFeed from "./pages/CameraFeed.jsx";
import CartPage from "./pages/CartPage.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  
  return (
    <AuthProvider>
      <CartProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Toaster position="bottom-center" reverseOrder={false} /> {/* Toast provider */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/cameras"
            element={
              <ProtectedRoute requiredPermission="acces_camere">
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
              <ProtectedRoute requiredPermission="administreaza_personal">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
