import { useRef, useState } from "react";
import ResetPasswordForm from "../ResetPasswordForm.jsx";
import { showError, showSuccess } from "../../utils/toast.jsx";
import { useEffect } from "react";


function ResetPasswordSection({ fetchUsers, resetUser, setResetUser }) {
  const resetPasswordRef = useRef(null);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    if (resetUser && resetPasswordRef.current) {
      resetPasswordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [resetUser]);

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
        showSuccess("Parola a fost schimbata cu succes!");
        setResetUser(null);
        setResetPassword("");
        fetchUsers();
      } else {
        showError(data.error || "Nu s-a putut schimba parola");
      }
    } catch (error) {
      console.error("Reset error:", error);
      showError("Eroare la schimbarea parolei");
    }
  };

  if (!resetUser) return null;

  return (
    <div ref={resetPasswordRef}>
      <ResetPasswordForm
        resetUser={resetUser}
        resetPassword={resetPassword || ""}
        resetPasswordRef={resetPasswordRef}
        onChangePassword={setResetPassword}
        onSubmit={handleSubmit}
        onCancel={() => setResetUser(null)}
      />
    </div>
  );
}

export default ResetPasswordSection;
