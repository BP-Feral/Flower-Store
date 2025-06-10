import "../styles/commonStyles.css";
import "../styles/LogoutCardLayout.css";

function LogoutCard({ onLogout }) {
  return (
    <div className="card">
      <button onClick={onLogout} className="logoutButton">Deconectare</button>
    </div>
  );
}

export default LogoutCard;
