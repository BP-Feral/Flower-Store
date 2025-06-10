import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";
import CustomizationCard from "../components/CustomizationCard.jsx";

function Settings() {
    const { user } = useContext(AuthContext);
  
    if (!user) return <p style={{ color: "white" }}>Trebuie sa fi autentificat.</p>;
  
    return (
      <div className="pageWrapper">
        <h1 className="heading">Setari</h1>
        <p style={{ textAlign: "center", color: "#ccc", marginBottom: "2rem" }}>
          Modifica preferintele sau schimba configurarile magazinului (necesita permisiuni).
        </p>
  
        {user.permissions?.customizare_magazin && <CustomizationCard />}

      </div>
    );
  }
  
  
  export default Settings;