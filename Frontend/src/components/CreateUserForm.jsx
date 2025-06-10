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
      <h3>Adauga cont nou</h3>
      <input
        type="text"
        ref={createUserRef}
        placeholder="Nume Utilizator"
        value={newUsername}
        onChange={(e) => onChangeUsername(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Parola"
        value={newUserPassword}
        onChange={(e) => onChangePassword(e.target.value)}
        className="input"
      />
      <div className="permissionsDisplay">
        {[
          "adauga_produs",
          "modifica_produs",
          "sterge_produs",
          "citire_tag",
          "adauga_tag",
          "sterge_tag",
          "modifica_tag",
          "acces_camere",
          "customizare_magazin"
        ].map((perm) => (
          <label
              key={perm}
              className={
                perm === "acces_camere" ? "permissionItem administreaza_personal" : "permissionItem"
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
      <button type="submit" className="createButton">Salveaza</button>
      <button type="button" onClick={onCancel} className="deleteButton">Anuleaza</button>
    </form>
  );
}

export default CreateUserForm;
