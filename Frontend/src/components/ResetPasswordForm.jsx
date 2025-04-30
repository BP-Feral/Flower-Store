import "../styles/AdminLayout.css";
import "../styles/FormControlsLayout.css";

function ResetPasswordForm({
    resetUser,
    resetPassword,
    onChangePassword,
    onSubmit,
    onCancel,
    resetPasswordRef,
  }) {
  return (
    <div className="card">
      <h3>Reset Password for {resetUser.username}</h3>
      <form onSubmit={onSubmit} className="createForm">
        <input
            type="password"
            ref={resetPasswordRef}
            placeholder="New Password"
            value={resetPassword}
            onChange={(e) => onChangePassword(e.target.value)}
            className="input"
        required
        />
        <button type="submit" className="createButton">Save New Password</button>
        <button type="button" onClick={onCancel} className="deleteButton">Cancel</button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;