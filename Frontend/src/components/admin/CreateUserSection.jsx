// components/admin/CreateUserSection.jsx
import { useRef, useState } from "react";
import CreateUserForm from "../CreateUserForm.jsx";
import { showError, showSuccess } from "../../utils/toast.jsx";

function CreateUserSection({ fetchUsers }) {
  const createUserRef = useRef(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [permissions, setPermissions] = useState({
    add_product: false,
    edit_product: false,
    delete_product: false,
    view_tags: false,
    create_tags: false,
    delete_tags: false,
    edit_tags: false,
    view_cameras: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newUserPassword.trim()) {
      showError("Username and Password are required.");
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
            add_product: false,
            edit_product: false,
            delete_product: false,
            view_tags: false,
            create_tags: false,
            delete_tags: false,
            edit_tags: false,
            view_cameras: false,
          });
        setShowCreateForm(false);
        fetchUsers();
      } else {
        showError(data.error || "Failed to create user.");
      }
    } catch (error) {
      console.error("Create error:", error);
      showError("Error creating user.");
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
      Create New User
    </button>
  );
}

export default CreateUserSection;
