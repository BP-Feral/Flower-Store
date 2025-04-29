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
          {users.map((user) => (
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
                  {user.username === "admin" && (
                    <span className={styles.adminBadge}>Admin</span>
                  )}
                </>
              )}
            </td>
          
            <td>
              <div className={styles.permissionsDisplay}>
                {editingUserId === user.id ? (
                  Object.keys(editPermissions).map((key) => (
                    <label key={key} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        name={key}
                        checked={editPermissions[key]}
                        onChange={onEditPermissionChange}
                      />
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))
                ) : (
                  Object.entries(JSON.parse(user.permissions)).map(([key, value]) => (
                    <label key={key} className={styles.permissionItem}>
                      <input type="checkbox" checked={value} disabled />
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))
                )}
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
          
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;