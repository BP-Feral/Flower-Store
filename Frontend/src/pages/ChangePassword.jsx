import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import styles from "../styles/ChangePassword.module.css";

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
        username: username, // 👈 Send username too
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
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={handlePasswordChange}
            required
            className={styles.input}
          />
          <div className={styles.requirements}>
            <p style={{ color: errors.length ? "green" : "#fc618a" }}>
              {errors.length ? "✅" : "❌"} At least 8 characters
            </p>
            <p style={{ color: errors.number ? "green" : "#fc618a" }}>
              {errors.number ? "✅" : "❌"} Contains a number
            </p>
            <p style={{ color: errors.uppercase ? "green" : "#fc618a" }}>
              {errors.uppercase ? "✅" : "❌"} Contains an uppercase letter
            </p>
            <p style={{ color: errors.lowercase ? "green" : "#fc618a" }}>
              {errors.lowercase ? "✅" : "❌"} Contains a lowercase letter
            </p>
          </div>
          <button
            type="submit"
            disabled={!isPasswordValid}
            className={isPasswordValid ? styles.button : styles.buttonDisabled}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
