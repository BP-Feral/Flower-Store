import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast.jsx";
import { CheckCircle, XCircle } from "lucide-react";
import "../styles/loginLayout.css"

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const validatePassword = (password) => {
    const errors = {};
    errors.length = password.length >= 8;
    errors.number = /\d/.test(password);
    errors.uppercase = /[A-Z]/.test(password);
    errors.lowercase = /[a-z]/.test(password);
    return errors;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setErrors(validatePassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allValid = Object.values(errors).every(Boolean);

    if (!allValid) {
      showError("Please meet all password requirements.");
      return;
    }

    const response = await fetch("http://localhost:5000/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("Password changed successfully!");
      localStorage.removeItem("forcePasswordChange");
      navigate("/admin");
    } else {
      showError("Failed to change password: " + (data.error || ""));
    }
  };

  const isPasswordValid = Object.values(errors).every(Boolean);

  return (
    <div className="loginWrapper">
      <div className="loginCard">
        <h2 className="heading">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={handlePasswordChange}
            required
            className="loginInput"
          />
          <div className="requirements">
          <p style={{ color: errors.length ? "green" : "#fc618a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {errors.length ? <CheckCircle size={16} /> : <XCircle size={16} />}
            At least 8 characters
          </p>
          <p style={{ color: errors.number ? "green" : "#fc618a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {errors.number ? <CheckCircle size={16} /> : <XCircle size={16} />}
            Contains a number
          </p>
          <p style={{ color: errors.uppercase ? "green" : "#fc618a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {errors.uppercase ? <CheckCircle size={16} /> : <XCircle size={16} />}
            Contains an uppercase letter
          </p>
          <p style={{ color: errors.lowercase ? "green" : "#fc618a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {errors.lowercase ? <CheckCircle size={16} /> : <XCircle size={16} />}
            Contains a lowercase letter
          </p>

          </div>
          <button
            type="submit"
            disabled={!isPasswordValid}
            className="button"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
