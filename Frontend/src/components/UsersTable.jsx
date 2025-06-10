import "../styles/UserTableLayout.css";
import "../styles/FormControlsLayout.css";
import "../styles/commonStyles.css";

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
      <h2 className="heading">Atribuiri Personal</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nume Utilizator</th>
            <th>Permisiuni</th>
            <th>Actiuni</th>
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
                          <span className="adminBadge">Administrator</span>
                        ) : (
                          <span className="staffBadge">Personal</span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td>
                  <div className="permissionsDisplay">
                    {[
                      "adauga_produs",
                      "modifica_produs",
                      "sterge_produs",
                      "citire_tag",
                      "adauga_tag",
                      "sterge_tag",
                      "modifica_tag",
                      "customizare_magazin",
                      ...(user.username === "admin" ? ["administreaza_personal", "acces_camere"] : ["acces_camere"]),
                    ].map((permKey) => {
                      const perms = editingUserId === user.id
                        ? editPermissions
                        : JSON.parse(user.permissions || "{}");

                      const value = perms[permKey] || false;

                      const permissionLabelClass =
                      permKey === "administreaza_personal" || permKey === "acces_camere"
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
                          <button onClick={() => onSaveEdit(user.id)} className="createButton">Salveaza</button>
                          <button onClick={() => setEditingUserId(null)} className="deleteButton">Anuleaza</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => onEdit(user)} className="editButton">Modifica</button>
                          <button onClick={() => onResetPassword(user)} className="resetButton">Schimba Parola</button>
                          <button onClick={() => onDelete(user.id)} className="deleteButton">Sterge</button>
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
