import { useState } from "react";
import UsersTable from "../UsersTable.jsx";
import { showError, showSuccess } from "../../utils/toast.jsx";

import "../../styles/UserTableLayout.css";
import "../../styles/FormControlsLayout.css";

function EditUserSection({ users, fetchUsers, setResetUser }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPermissions, setEditPermissions] = useState({});

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditUsername(user.username);
    try {
      setEditPermissions(JSON.parse(user.permissions));
    } catch {
      setEditPermissions({});
    }
  };

  const handleSave = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/update-user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editUsername,
          permissions: JSON.stringify(editPermissions),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess(data.message);
        setEditingUserId(null);
        fetchUsers();
      } else {
        showError(data.error || "Failed to update user.");
      }
    } catch (err) {
      console.error("Edit error:", err);
      showError("Error updating user.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/delete-user/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess(data.message);
        fetchUsers();
      } else {
        showError(data.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showError("Error deleting user.");
    }
  };

  return (
    <UsersTable
      users={users}
      editingUserId={editingUserId}
      editUsername={editUsername}
      editPermissions={editPermissions}
      onEdit={handleEdit}
      onEditUsernameChange={setEditUsername}
      onEditPermissionChange={(e) => {
        const { name, checked } = e.target;
        setEditPermissions((prev) => ({ ...prev, [name]: checked }));
      }}
      onSaveEdit={handleSave}
      onDelete={handleDelete}
      setEditingUserId={setEditingUserId}
      onResetPassword={setResetUser}
    />
  );
}

export default EditUserSection;
