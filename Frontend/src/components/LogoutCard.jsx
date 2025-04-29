import styles from "../styles/Admin.module.css";

function LogoutCard({ onLogout }) {
  return (
    <div className={styles.card}>
      <button onClick={onLogout} className={styles.logoutButton}>Logout</button>
    </div>
  );
}

export default LogoutCard;
