import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { showError, showSuccess } from "../utils/toast.jsx";

import styles from "../styles/Admin.module.css";

import ProfileCard from "../components/ProfileCard";
import UsersTable from "../components/UsersTable";
import CreateUserForm from "../components/CreateUserForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import CustomizationCard from "../components/CustomizationCard";
import LogoutCard from "../components/LogoutCard";

function AdminPanel() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const resetPasswordRef = useRef(null);
  const createUserRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [resetUser, setResetUser] = useState(null);

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
  });
  
  const [editUsername, setEditUsername] = useState("");
  const [editPermissions, setEditPermissions] = useState({
    add_product: false,
    edit_product: false,
    delete_product: false,
    view_tags: false,
    create_tags: false,
    delete_tags: false,
    edit_tags:false,
  });
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  
    if (user.username !== "admin") {
      navigate("/");
      return;
    }
  
    setIsLoading(false); // stop loading
  
    // Now fetch users
    fetchUsers();
  }, [user, navigate]);
  

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:5000/users", {
        method: "GET",
        headers: {
          "Authorization": token,
        },
      });
  
      if (response.status === 401 || response.status === 403) {
        // Token invalid or expired
        showError("Session expired. Please login again.");
        localStorage.clear();
        setUser(null);
        navigate("/login");
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
  
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showError("Failed to load users!");
      setUsers([]);
    }
  };
  
  
  if (isLoading) {
    return <div style={{ textAlign: "center", marginTop: "2rem", color: "white" }}>Loading...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Admin Panel</h2>

      <ProfileCard />

      {/* Staff Management */}
      {user.permissions.manage_users && (
        <>
          <UsersTable
            users={users}
            editingUserId={editingUserId}
            editUsername={editUsername}
            editPermissions={editPermissions}
            onEdit={(user) => {
              setEditingUserId(user.id);
              setEditUsername(user.username);
              try {
                setEditPermissions(JSON.parse(user.permissions));
              } catch {
                setEditPermissions({
                  add_product: false,
                  edit_product: false,
                  delete_product: false,
                  manage_users: false,
                });
              }
            }}
            onDelete={async (userId) => {
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
            }}
            onResetPassword={(user) => {
              setResetUser(user);
              setResetPassword("");
              setTimeout(() => {
                resetPasswordRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                resetPasswordRef.current?.focus();
              }, 100);
            }}
            onEditUsernameChange={setEditUsername}
            onEditPermissionChange={(e) => {
              const { name, checked } = e.target;
              setEditPermissions((prev) => ({ ...prev, [name]: checked }));
            }}
            onSaveEdit={async (userId) => {
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
              } catch (error) {
                console.error("Edit error:", error);
                showError("Error updating user.");
              }
            }}
            setEditingUserId={setEditingUserId}
          />

          {showCreateForm ? (
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
              onSubmit={async (e) => {
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
                    fetchUsers();
                    setShowCreateForm(false);
                  } else {
                    showError(data.error || "Failed to create user.");
                  }
                } catch (error) {
                  console.error("Create error:", error);
                  showError("Error creating user.");
                }
              }}
              onCancel={() => {
                setShowCreateForm(false);
                setNewUsername("");
                setNewUserPassword("");
                setPermissions({
                  add_product: false,
                  edit_product: false,
                  delete_product: false,});
                }}
            />
          ) : (
            <button
              onClick={() => {
                setShowCreateForm(true);
                setNewUsername(""); // reset username
                setNewUserPassword(""); // reset password
                setPermissions({
                  add_product: false,
                  edit_product: false,
                  delete_product: false,
                }); // reset all checkboxes

                setTimeout(() => {
                  createUserRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  createUserRef.current?.focus();
                }, 100); // wait for the form to actually appear first
              }}
              className={styles.createButton}
            >
              Create New User
            </button>
          )}

          {resetUser && (
            <ResetPasswordForm
              resetUser={resetUser}
              resetPassword={resetPassword}
              resetPasswordRef={resetPasswordRef}
              onChangePassword={setResetPassword}
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`http://localhost:5000/reset-password/${resetUser.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: resetPassword }),
                  });
                  const data = await response.json();
                  if (response.ok) {
                    showSuccess("Password reset successfully!");
                    setResetUser(null);
                    setResetPassword("");
                    fetchUsers();
                  } else {
                    showError(data.error || "Failed to reset password.");
                  }
                } catch (error) {
                  console.error("Reset error:", error);
                  showError("Error resetting password.");
                }
              }}
              onCancel={() => setResetUser(null)}
            />
          )}
        </>
      )}

      {/* Customization */}
      {user.permissions.customize_store && (
        <CustomizationCard />
      )}

      <LogoutCard onLogout={() => {
        localStorage.clear();
        setUser(null);
        navigate("/login");
      }} />
    </div>
  );
}

export default AdminPanel;
