import styles from "../styles/Admin.module.css";

function ProfileCard() {
  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Profile</h2>
      <p><strong>Username:</strong> admin</p>
      <p><strong>Email:</strong> admin@flowerstore.com</p>
      <p><strong>Role:</strong> Super Administrator</p>
    </div>
  );
}

export default ProfileCard;