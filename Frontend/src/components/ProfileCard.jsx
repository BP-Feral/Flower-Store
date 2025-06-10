import "../styles/commonStyles.css";


function ProfileCard() {
  return (
    <div className="card">
      <h2 className="heading">Profil</h2>
      <p><strong>Nume Utilizator:</strong> admin</p>
      <p><strong>Email:</strong> admin@flowerstore.com</p>
      <p><strong>Rol:</strong> Super Administrator</p>
    </div>
  );
}

export default ProfileCard;