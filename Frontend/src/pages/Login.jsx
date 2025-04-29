import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import { AuthContext } from "../contexts/AuthContext"; // use context
import styles from "../styles/Login.module.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // get setUser from context

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username.trim()) {
      showError("Username is required.");
      return;
    }
  
    if (!password.trim()) {
      showError("Password is required.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("forcePasswordChange", data.force_password_change);
        localStorage.setItem("permissions", JSON.stringify(data.permissions));
        localStorage.setItem("username", data.username);
  
        setUser({ username: data.username, permissions: data.permissions });
  
        if (data.force_password_change) {
          showSuccess("First login detected! Please set a strong new password.");
          navigate("/change-password");
        } else if (data.username === "admin") {
          showSuccess("Welcome Admin!");
          navigate("/admin");
        } else {
          showSuccess("Login successful!");
          navigate("/");
        }
      } else {
        showError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Login failed due to server error.");
    }
  };
  

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
