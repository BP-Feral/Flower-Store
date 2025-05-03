import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/ProfileCard.jsx";
import LogoutCard from "../components/LogoutCard.jsx";

import "../styles/commonStyles.css";

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="pageWrapper">
      <h2 className="heading">My Profile</h2>
      <ProfileCard />
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

export default Profile;
