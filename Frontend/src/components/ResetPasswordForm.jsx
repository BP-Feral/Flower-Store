import "../styles/commonStyles.css";
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
      <h3>Schimba parola pentru {resetUser.username}</h3>
      <form onSubmit={onSubmit} className="createForm">
        <input
            type="password"
            ref={resetPasswordRef}
            placeholder="Parola Noua"
            value={resetPassword}
            onChange={(e) => onChangePassword(e.target.value)}
            className="input"
        required
        />
        <button type="submit" className="createButton">Salveaza parola noua</button>
        <button type="button" onClick={onCancel} className="deleteButton">Anuleaza</button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;