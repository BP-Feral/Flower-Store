import "../styles/FormControlsLayout.css";
import "../styles/UserTableLayout.css";

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
    <form onSubmit={onSubmit}>
      <h3>Create New User</h3>
      <input
        type="text"
        ref={createUserRef}
        placeholder="Username"
        value={newUsername}
        onChange={(e) => onChangeUsername(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={newUserPassword}
        onChange={(e) => onChangePassword(e.target.value)}
        className="input"
      />
      <div className="permissionsDisplay">
        {[
          "add_product",
          "edit_product",
          "delete_product",
          "view_tags",
          "create_tags",
          "delete_tags",
          "edit_tags",
          "view_cameras"
        ].map((perm) => (
          <label
              key={perm}
              className={
                perm === "view_cameras" ? "permissionItem manageUsersPermission" : "permissionItem"
              }
            >
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
      <button type="submit" className="createButton">Save User</button>
      <button type="button" onClick={onCancel} className="deleteButton">Cancel</button>
    </form>
  );
}

export default CreateUserForm;
