import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";
import CustomizationCard from "../components/CustomizationCard.jsx";

function Settings() {
    const { user } = useContext(AuthContext);
  
    if (!user) return <p style={{ color: "white" }}>You must be logged in.</p>;
  
    return (
      <div className="pageWrapper">
        <h1 className="heading">Settings</h1>
        <p style={{ textAlign: "center", color: "#ccc", marginBottom: "2rem" }}>
          Adjust your preferences or customize store behavior (if permitted).
        </p>
  
        {user.permissions?.customize_store && <CustomizationCard />}

      </div>
    );
  }
  
  
  export default Settings;