import styles from "../styles/Admin.module.css";

function CreateUserForm({
  createUserRef,
  newUsername,
  newUserPassword,
  permissions,
  onChangeUsername,
  onChangePassword,
  onPermissionChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className={styles.createForm}>
      <h3>Create New User</h3>
      <input
        type="text"
        ref={createUserRef}
        placeholder="Username"
        value={newUsername}
        onChange={(e) => onChangeUsername(e.target.value)}
        className={styles.input}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={newUserPassword}
        onChange={(e) => onChangePassword(e.target.value)}
        className={styles.input}
        required
      />
      <div className={styles.permissionsDisplay}>
  {["add_product", "edit_product", "delete_product"].map((perm) => (
    <label key={perm} className={styles.permissionItem}>
      <input
        type="checkbox"
        name={perm}
        checked={permissions[perm]}
        onChange={onPermissionChange}
      />
      {perm.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </label>
  ))}
</div>
      <button type="submit" className={styles.createButton}>Save User</button>
      <button type="button" onClick={onCancel} className={styles.deleteButton}>Cancel</button>
    </form>
  );
}

export default CreateUserForm;