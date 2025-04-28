import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Navbar.module.css";
import { showSuccess } from "../utils/toast";

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
            <div className={styles.avatar}></div>
            <span className={styles.username}>{user.username}</span>
            {showDropdown && (
              <div className={styles.dropdown}>
                <Link to="/profile">Item 1</Link>
                <Link to="/settings">Item 2</Link>
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
