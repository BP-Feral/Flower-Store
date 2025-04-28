import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../utils/toast";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Admin.module.css";


function Admin() {

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // loading state
  const [isLoading, setIsLoading] = useState(true);


  const [users, setUsers] = useState([]);
  
  // create user
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [permissions, setPermissions] = useState({
    add_products: false,
    edit_products: false,
    delete_products: false,
    manage_users: false,
  });

  // track change password
  const [resetUser, setResetUser] = useState(null); // user being reset

  // track edit user
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPermissions, setEditPermissions] = useState({
    add_products: false,
    edit_products: false,
    delete_products: false,
    manage_users: false,
  });
  const handleResetPassword = async (e) => {
    e.preventDefault();
  
    if (!newPassword.trim()) {
      showError("Password is required.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/reset-password/${resetUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showSuccess("Password reset successfully!");
        setResetUser(null);
        setNewPassword("");
        fetchUsers(); // optional, to refresh table
      } else {
        showError(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      showError("Error resetting password.");
    }
  };
  
  const handleOpenResetPassword = (user) => {
    setResetUser(user);
    setNewPassword("");
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditUsername(user.username);
    try {
      setEditPermissions(JSON.parse(user.permissions));
    } catch {
      setEditPermissions({
        add_products: false,
        edit_products: false,
        delete_products: false,
        manage_users: false,
      });
    }
  };
  

  const handleSaveEdit = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (error) {
      console.error("Edit error:", error);
      showError("Error updating user.");
    }
  };
  
  
  const handleEditPermissionChange = (e) => {
    const { name, checked } = e.target;
    setEditPermissions((prev) => ({ ...prev, [name]: checked }));
  };
  
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
    setIsLoading(false); // Set loading to false after checks pass
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
    localStorage.clear(); // remove token, username, etc
    setUser(null);         // clear user in AuthContext (this will instantly update Navbar)
    showSuccess("Logged out successfully.");
    navigate("/login");    // redirect to login page
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", marginTop: "2rem", color: "white" }}>Loading...</div>;
  }

      
  return (
  <div className={styles.pageWrapper}>
    <h2 className={styles.heading}>Admin Panel</h2>
    
    {/* Profile Section */}
    <div className={styles.card}>
      <h2 className={styles.heading}>Profile</h2>
      <p><strong>Username:</strong> Admin</p>
      <p><strong>Email:</strong> admin@flowerstore.com</p>
      <p><strong>Role:</strong> Super Administrator</p>
    </div>

    {/* Users Section */}
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
        {users.map((user, index) => (
          <tr key={user.id} className={user.username === "admin" ? styles.adminRow : ""}>

            {editingUserId === user.id ? (
              <>
              <td className={styles.idColumn}>{user.id}</td>
              <td className={styles.usernameColumn}>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className={styles.input}
                />
              </td>
              <td>
              <div className={styles.permissionsDisplay}>
                {Object.keys(editPermissions).map(key => (
                  <label key={key} className={styles.permissionItem}>
                    <input
                      type="checkbox"
                      name={key}
                      checked={editPermissions[key]}
                      onChange={handleEditPermissionChange}
                    />
                    {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
              </td>
              <td>
                <button onClick={() => handleSaveEdit(user.id)} className={styles.createButton}>
                  Save
                </button>
                <button onClick={() => setEditingUserId(null)} className={styles.deleteButton}>
                  Cancel
                </button>
              </td>
            </>
            ) : (
            <>
              <td className={styles.idColumn}>{user.id}</td>
              <td className={styles.usernameColumn}>{user.username}</td>
              <td>
                <div className={styles.permissionsDisplay}>
                  {Object.entries(JSON.parse(user.permissions)).map(([key, value]) => (
                    <label key={key} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={value}
                        disabled
                      />
                      {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </td>
              <td>
                {user.username !== "admin" && (
                  <>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.resetButton}
                      onClick={() => handleOpenResetPassword(user)}
                    >
                      Reset Password
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </>

            )}
          </tr>
        ))}

        </tbody>
      </table>
      {/* Create User Form */}
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
      {/* Reset Password Form */}
      {resetUser && (
        <div className={styles.card}>
          <h3>Reset Password for {resetUser.username}</h3>
          <form onSubmit={handleResetPassword} className={styles.createForm}>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.createButton}>
              Save New Password
            </button>
            <button
              type="button"
              onClick={() => setResetUser(null)}
              className={styles.deleteButton}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>

    {/* Customization Section */}
    <div className={styles.card}>
      <h2 className={styles.heading}>Customization</h2>
      <p>Feature to change "Flower Store" title coming soon!</p>
    </div>

    {/* Logout Button */}
    <div className={styles.card}>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </div>

  </div>
);
}
export default Admin;
