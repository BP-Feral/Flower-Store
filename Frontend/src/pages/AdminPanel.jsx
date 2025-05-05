import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { showError } from "../utils/toast.jsx";

import "../styles/commonStyles.css";

import CustomizationCard from "../components/CustomizationCard.jsx";
import EditUserSection from "../components/admin/EditUserSection.jsx";
import CreateUserSection from "../components/admin/CreateUserSection.jsx";
import ResetPasswordSection from "../components/admin/ResetPasswordSection.jsx";
import CameraSettingsSection from "../components/admin/CameraSettingsSection.jsx";
import LogoutCard from "../components/LogoutCard.jsx";

function AdminPanel() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resetUser, setResetUser] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.username !== "admin") {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/users", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      if (response.status === 401 || response.status === 403) {
        showError("Session expired. Please login again.");
        localStorage.clear();
        setUser(null);
        navigate("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showError("Failed to load users!");
      setUsers([]);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", marginTop: "2rem", color: "white" }}>Loading...</div>;
  }

  return (
    <div className="pageWrapper">
      <h2 className="heading">Admin Panel</h2>
      {user.permissions.manage_staff && (
        <>
          <EditUserSection
            users={users}
            fetchUsers={fetchUsers}
            setResetUser={setResetUser}
          />
          <CreateUserSection fetchUsers={fetchUsers} />
          <ResetPasswordSection
            fetchUsers={fetchUsers}
            resetUser={resetUser}
            setResetUser={setResetUser}
          />
        </>
      )}

      {user.permissions.customize_store && (
        <>
          <CustomizationCard />
        </>
      )}
      {user.permissions.manage_staff && <CameraSettingsSection />}
      <LogoutCard
        onLogout={() => {
          localStorage.clear();
          setUser(null);
          navigate("/login");
        }}
      />
    </div>
  );
}

export default AdminPanel;