import "../styles/UserTableLayout.css";
import "../styles/FormControlsLayout.css";
import "../styles/AdminLayout.css";

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
    <div className="card">
      <h2 className="heading">Staff Management</h2>
      <table className="table">
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
              <tr key={user.id} className={user.username === "admin" ? "adminRow" : ""}>
                <td className="idColumn">{user.id}</td>
                <td className="usernameColumn">
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => onEditUsernameChange(e.target.value)}
                      className="input"
                    />
                  ) : (
                    <div className="userInfo">
                      <img
                        src={user.profile_picture}
                        alt="Avatar"
                        className="avatarSmall"
                      />
                      <div>
                        {user.username}
                        {user.username === "admin" ? (
                          <span className="adminBadge">Admin</span>
                        ) : (
                          <span className="staffBadge">Staff</span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td>
                  <div className="permissionsDisplay">
                    {[
                      "add_product",
                      "edit_product",
                      "delete_product",
                      "view_tags",
                      "create_tags",
                      "delete_tags",
                      "edit_tags",
                      ...(user.username === "admin" ? ["manage_users", "view_cameras"] : ["view_cameras"]),
                    ].map((permKey) => {
                      const perms = editingUserId === user.id
                        ? editPermissions
                        : JSON.parse(user.permissions || "{}");

                      const value = perms[permKey] || false;

                      const permissionLabelClass =
                      permKey === "manage_users" || permKey === "view_cameras"
                        ? "permissionItem manageUsersPermission"
                        : "permissionItem";
                        
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
                    <div className="actionButtons">
                      {editingUserId === user.id ? (
                        <>
                          <button onClick={() => onSaveEdit(user.id)} className="createButton">Save</button>
                          <button onClick={() => setEditingUserId(null)} className="deleteButton">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => onEdit(user)} className="editButton">Edit</button>
                          <button onClick={() => onResetPassword(user)} className="resetButton">Reset Password</button>
                          <button onClick={() => onDelete(user.id)} className="deleteButton">Delete</button>
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
