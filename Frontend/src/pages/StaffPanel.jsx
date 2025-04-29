import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Admin.module.css"; // still using the same CSS

import ProfileCard from "../components/ProfileCard";
import UsersTable from "../components/UsersTable";
import CreateUserForm from "../components/CreateUserForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import CustomizationCard from "../components/CustomizationCard";
import LogoutCard from "../components/LogoutCard";

function StaffPanel() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Staff Panel</h2>

      <ProfileCard />

      {user.permissions.manage_users && (
        <>
          <UsersTable 
            // Need to refactor fetchUsers logic a bit
          />
          <CreateUserForm />
          <ResetPasswordForm />
        </>
      )}

      {user.permissions.edit_product && (
        <div className={styles.card}>
          <h2 className={styles.heading}>Manage Products</h2>
          <p>Feature to add/edit/delete products coming soon!</p>
        </div>
      )}

      {user.permissions.customize_store && (
        <CustomizationCard />
      )}

      <LogoutCard onLogout={() => {
        localStorage.clear();
        window.location.href = "/login";
      }} />
    </div>
  );
}

export default StaffPanel;
