import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Navbar.module.css";
import { showSuccess } from "../utils/toast.jsx";

function Navbar() {
  const { user } = useContext(AuthContext);
  const { setUser } = useContext(AuthContext); // use context inside Navbar or Admin Panel
  
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);


  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.clear(); // remove token, username, etc
    setUser(null);         // clear user in AuthContext (this will instantly update Navbar)
    showSuccess("Logged out successfully.");
    navigate("/login");    // redirect to login page
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Flower Store</Link>
      </div>

      <div className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/store">Store</Link>
        <Link to="/about">About</Link>
      </div>

      <div className={styles.userSection}>
        {user ? (
          <div className={styles.profile} onClick={toggleDropdown}>
            <span className={styles.username}>{user.username}</span>
            <div className={styles.avatar}></div>
            
            {showDropdown && (
              <div className={styles.dropdown}>
                <Link to="/profile">Profile</Link>
                <Link to="/settings">Settings</Link>

                {(user.permissions?.add_product || user.permissions?.edit_product || user.permissions?.delete_product) && (
                  <Link to="/manage-products">Manage Products</Link>
                )}

                {user.username === "admin" && (
                  <Link to="/admin">Admin Panel</Link>
                )}

                <button onClick={handleLogout} className={styles.dropdownButton}>
                  Logout
                </button>
              </div>
            )}

          </div>
        ) : (
          <button onClick={() => navigate("/login")} className={styles.loginButton}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
