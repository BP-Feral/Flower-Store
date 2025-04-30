import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const toastMessage = sessionStorage.getItem("postReloadToast");
  
    if (toastMessage && !window.__toastAlreadyShown) {
      window.__toastAlreadyShown = true; // ✅ prevent double execution
      import("../utils/toast.jsx").then(({ showSuccess }) => {
        showSuccess(toastMessage);
        sessionStorage.removeItem("postReloadToast");
      });
    }
  }, []);
  
  

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      fetch("http://localhost:5000/validate-token", {
        method: "GET",
        headers: {
          "Authorization": storedToken,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Invalid token");
          }
          return response.json();
        })
        .then((data) => {
          setUser({
            username: data.username,
            profile_picture: data.profile_picture,
            permissions: data.permissions,
            token: storedToken,
          });
        })
        .catch((error) => {
          console.error("Token validation error:", error);
          localStorage.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "2rem", color: "white" }}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
