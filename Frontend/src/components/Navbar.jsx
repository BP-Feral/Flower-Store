import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Navbar.module.css";
import { showSuccess } from "../utils/toast.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { ShoppingCart } from "lucide-react"; 
import { User, Settings, PackagePlus, Shield, 
  Video, ShoppingCart as CartIcon, LogOut} from "lucide-react";
import { useEffect, useRef } from "react";

function Navbar() {
  const [storeTitle, setStoreTitle] = useState("Magazin");

  useEffect(() => {
    fetch("http://localhost:5000/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.store_title) setStoreTitle(data.store_title);
      })
      .catch(() => console.error("Failed to load store title"));
  }, []);

  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { cartItems } = useCart();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLogout = () => {
    localStorage.clear(); // remove token, username, etc
    setUser(null);         // clear user in AuthContext (this will instantly update Navbar)
    showSuccess("Logged out successfully.");
    navigate("/login");    // redirect to login page
  };

  return (
    <nav className={styles.navbar}>
  <div className={styles.left}>
  <Link to="/" className={styles.logo}>{storeTitle}</Link>
  </div>

  <div className={styles.center}>
    <Link to="/">Acasa</Link>
    <Link to="/store">Magazin</Link>
    <Link to="/about">Despre Proiect</Link>
  </div>

  <div className={styles.right}>
    <Link to="/cart" className={styles.cartIcon}>
      <ShoppingCart />
      {cartItems.length > 0 && (
        <span className={styles.cartCount}>{cartItems.length}</span>
      )}
    </Link>

    {user ? (
      <div className={styles.profile} onClick={toggleDropdown}>
        <span className={styles.username}>{user.username}</span>
        <img src={user.profile_picture} alt=" " className={styles.avatar} />
        {showDropdown && (
          <div ref={dropdownRef} className={styles.dropdown}>
                  <Link to="/profile"><User size={16} /> Profil</Link>
                  <Link to="/settings"><Settings size={16} /> Setari</Link>

                  {(user.permissions?.adauga_produs || user.permissions?.modifica_produs || user.permissions?.sterge_produs) && (
    <Link to="/manage-products"><PackagePlus size={16} />Editeaza Produse</Link>
  )}

  {user.username === "admin" && (
    <Link to="/admin"><Shield size={16} />Panou Administrator</Link>
  )}

  {user.permissions?.acces_camere && (
    <Link to="/cameras"><Video size={16} />Camere Video</Link>
  )}
                
                <Link to="/cart"><CartIcon size={16} />Cos Cumparaturi</Link>

<button onClick={handleLogout} className={styles.dropdownButton}>
  <LogOut size={16} /> Deconectare
                </button>
              </div>
            )}

          </div>
        ) : (
          <button onClick={() => navigate("/login")} className={styles.loginButton}>
            Autentificare
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
