import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Admin.module.css";
import { showError, showSuccess } from "../utils/toast";

function Admin() {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [permissions, setPermissions] = useState({
    add_products: false,
    edit_products: false,
    delete_products: false,
    manage_users: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const forceChange = localStorage.getItem("forcePasswordChange");
    const username = localStorage.getItem("username");
  
    if (!token) {
      navigate("/login");
      return;
    }
  
    if (forceChange === "true") {
      navigate("/change-password");
      return;
    }
  
    if (username !== "admin") {
      navigate("/");
      return;
    }
  
    fetchUsers();
  }, []);
  

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showError("Failed to load users!");
    }
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
  
    if (!newUsername.trim()) {
      showError("Username is required.");
      return;
    }
  
    if (!newPassword.trim()) {
      showError("Password is required.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          permissions: JSON.stringify(permissions),
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showSuccess(data.message);
        setNewUsername("");
        setNewPassword("");
        setPermissions({
          add_products: false,
          edit_products: false,
          delete_products: false,
          manage_users: false,
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

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

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
    } catch (error) {
      console.error("Delete error:", error);
      showError("Error deleting user.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Admin Panel</h2>

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
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td><pre>{user.permissions}</pre></td>
                <td>
                  {user.username !== "admin" && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className={styles.createButton}
          >
            Create New User
          </button>
        ) : (
          <form onSubmit={handleCreateUser} className={styles.createForm}>
            <h3>Create New User</h3>
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
            />

            <div className={styles.permissionsBox}>
              <label>
                <input
                  type="checkbox"
                  name="add_products"
                  checked={permissions.add_products}
                  onChange={handlePermissionChange}
                />
                Add Products
              </label>
              <label>
                <input
                  type="checkbox"
                  name="edit_products"
                  checked={permissions.edit_products}
                  onChange={handlePermissionChange}
                />
                Edit Products
              </label>
              <label>
                <input
                  type="checkbox"
                  name="delete_products"
                  checked={permissions.delete_products}
                  onChange={handlePermissionChange}
                />
                Delete Products
              </label>
              <label>
                <input
                  type="checkbox"
                  name="manage_users"
                  checked={permissions.manage_users}
                  onChange={handlePermissionChange}
                />
                Manage Users
              </label>
            </div>

            <button type="submit" className={styles.createButton}>
              Save User
            </button>
          </form>
        )}

        <button onClick={handleLogout} className={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Admin;
