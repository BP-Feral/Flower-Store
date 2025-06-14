import { useRef, useState } from "react";
import CreateUserForm from "../CreateUserForm.jsx";
import { showError, showSuccess } from "../../utils/toast.jsx";

function CreateUserSection({ fetchUsers }) {
  const createUserRef = useRef(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [permissions, setPermissions] = useState({
    adauga_produs: false,
    modifica_produs: false,
    sterge_produs: false,
    citire_tag: false,
    adauga_tag: false,
    sterge_tag: false,
    modifica_tag: false,
    acces_camere: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newUserPassword.trim()) {
      showError("Nume Utilizator si Parola sunt necesare!");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newUserPassword,
          permissions: JSON.stringify(permissions),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess(data.message);
        setNewUsername("");
        setNewUserPassword("");
        setPermissions({
          adauga_produs: false,
          modifica_produs: false,
          sterge_produs: false,
          citire_tag: false,
          adauga_tag: false,
          sterge_tag: false,
          modifica_tag: false,
          acces_camere: false,
          customizare_magazin: false,
          });
        setShowCreateForm(false);
        fetchUsers();
      } else {
        showError(data.error || "Nu s-a putut crea utilizator!");
      }
    } catch (error) {
      console.error("Create error:", error);
      showError("Eroare la crearea utilizatorului.");
    }
  };

  return showCreateForm ? (
    <CreateUserForm
      newUsername={newUsername}
      newUserPassword={newUserPassword}
      permissions={permissions}
      createUserRef={createUserRef}
      onChangeUsername={setNewUsername}
      onChangePassword={setNewUserPassword}
      onPermissionChange={(e) => {
        const { name, checked } = e.target;
        setPermissions((prev) => ({ ...prev, [name]: checked }));
      }}
      onSubmit={handleSubmit}
      onCancel={() => setShowCreateForm(false)}
    />
  ) : (
    <button
      onClick={() => {
        setShowCreateForm(true);
        setTimeout(() => {
          createUserRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          createUserRef.current?.focus();
        }, 100);
      }}
      className="createButton"
    >
      Adauga cont personal nou
    </button>
  );
}

export default CreateUserSection;
