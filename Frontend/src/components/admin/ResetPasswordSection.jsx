import { useRef, useState } from "react";
import ResetPasswordForm from "../ResetPasswordForm.jsx";
import { showError, showSuccess } from "../../utils/toast.jsx";

function ResetPasswordSection({ fetchUsers, resetUser, setResetUser }) {
  const resetPasswordRef = useRef(null);
  const [resetPassword, setResetPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/reset-password/${resetUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess("Password reset successfully!");
        setResetUser(null);
        setResetPassword("");
        fetchUsers();
      } else {
        showError(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      showError("Error resetting password.");
    }
  };

  if (!resetUser) return null;

  return (
    <ResetPasswordForm
      resetUser={resetUser}
      resetPassword={resetPassword || ""}
      resetPasswordRef={resetPasswordRef}
      onChangePassword={setResetPassword}
      onSubmit={handleSubmit}
      onCancel={() => setResetUser(null)}
    />
  );
}

export default ResetPasswordSection;
