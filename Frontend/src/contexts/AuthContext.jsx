import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedPermissions = localStorage.getItem("permissions");
    const storedToken = localStorage.getItem("token");

    if (storedUsername && storedToken) {
      setUser({
        username: storedUsername,
        permissions: storedPermissions ? JSON.parse(storedPermissions) : {},
        token: storedToken,
      });
    }

    setLoading(false); // Only AFTER checking storage
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
