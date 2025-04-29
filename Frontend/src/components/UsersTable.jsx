import styles from "../styles/Admin.module.css";

function UsersTable({
  users,
  editingUserId,
  editUsername,
  editPermissions,
  onEdit,
  onDelete,
  onResetPassword,
  onEditUsernameChange,
  onEditPermissionChange,
  onSaveEdit,
  setEditingUserId,
}) {
  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Staff Management</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className={user.username === "admin" ? styles.adminRow : ""}>
                <td className={styles.idColumn}>{user.id}</td>
                <td className={styles.usernameColumn}>
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => onEditUsernameChange(e.target.value)}
                      className={styles.input}
                    />
                  ) : (
                    <>
                      {user.username}
                      {user.username === "admin" ? (
                        <span className={styles.adminBadge}>Admin</span>
                      ) : (
                        <span className={styles.staffBadge}>Staff</span>
                      )}
                    </>
                  )}
                </td>
                <td>
                  <div className={styles.permissionsDisplay}>
                  {[
                    "add_product",
                    "edit_product",
                    "delete_product",
                    "view_tags",
                    "create_tags",
                    "delete_tags",
                    "edit_tags",
                    ...(user.username === "admin" ? ["manage_users"] : []),
                  ].map((permKey) => {
                    const perms = editingUserId === user.id ? editPermissions : JSON.parse(user.permissions || "{}");
                    const value = perms[permKey] || false;

                    const permissionLabelClass = permKey === "manage_users"
                      ? `${styles.permissionItem} ${styles.manageUsersPermission}`
                      : styles.permissionItem;

                    return (
                      <label key={permKey} className={permissionLabelClass}>
                        <input
                          type="checkbox"
                          name={permKey}
                          checked={value}
                          disabled={editingUserId !== user.id}
                          onChange={editingUserId === user.id ? onEditPermissionChange : undefined}
                        />
                        {permKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                    );
                  })}

                  </div>
                </td>

                <td>
                  {user.username !== "admin" && (
                    <div className={styles.actionButtons}>
                      {editingUserId === user.id ? (
                        <>
                          <button onClick={() => onSaveEdit(user.id)} className={styles.createButton}>Save</button>
                          <button onClick={() => setEditingUserId(null)} className={styles.deleteButton}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => onEdit(user)} className={styles.editButton}>Edit</button>
                          <button onClick={() => onResetPassword(user)} className={styles.resetButton}>Reset Password</button>
                          <button onClick={() => onDelete(user.id)} className={styles.deleteButton}>Delete</button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", color: "gray" }}>
                No users available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;