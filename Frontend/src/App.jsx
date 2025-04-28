import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";


function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <Toaster position="bottom-center" reverseOrder={false} /> {/* Toast provider */}
          <Routes>
            <Route path="/" element={<h1>Public Storefront</h1>} />
            <Route path="/store" element={<h1>Public Products Store</h1>} />
            <Route path="/about" element={<h1>About This Project</h1>} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
