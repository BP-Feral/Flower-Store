import { useNavigate } from "react-router-dom";
import styles from "../styles/Admin.module.css";

function Admin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Admin Panel</h2>
        <button onClick={handleLogout} className={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Admin;
