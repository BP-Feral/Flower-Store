import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast.jsx";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/loginLayout.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username.trim()) {
      showError("Introdu un nume!");
      return;
    }
  
    if (!password.trim()) {
      showError("Introdu o parola!");
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
          sessionStorage.setItem("postReloadToast", "Te-ai autentificat pentru prima data! Te rugam sa alegi o parola noua");
          window.location.href = "/change-password";
        } else if (data.username === "admin") {
          sessionStorage.setItem("postReloadToast", "Bine ai revenit administrator!");
          window.location.href = "/admin";
        } else {
          sessionStorage.setItem("postReloadToast", "Autentificat cu succes");
          window.location.href = "/";
        }

      } else {
        showError(data.error || "Autentificare esuata. Te rugam sa reintroduci datele.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Autentificare esuata datorita serverului.");
    }
  };
  

  return (
    <div className="loginWrapper">
      <div className="loginCard">
        <h2 className="heading">Autentificare</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nume Utilizator"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="loginInput"
          />
          <input
            type="password"
            placeholder="Parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="loginInput"
          />
          <button type="submit" className="button">
            Autentificare
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
