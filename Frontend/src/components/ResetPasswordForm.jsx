import styles from "../styles/Admin.module.css";

function ResetPasswordForm({
    resetUser,
    resetPassword,
    onChangePassword,
    onSubmit,
    onCancel,
    resetPasswordRef,
  }) {
  return (
    <div className={styles.card}>
      <h3>Reset Password for {resetUser.username}</h3>
      <form onSubmit={onSubmit} className={styles.createForm}>
        <input
            type="password"
            ref={resetPasswordRef}
            placeholder="New Password"
            value={resetPassword}
            onChange={(e) => onChangePassword(e.target.value)}
            className={styles.input}
        required
        />
        <button type="submit" className={styles.createButton}>Save New Password</button>
        <button type="button" onClick={onCancel} className={styles.deleteButton}>Cancel</button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;