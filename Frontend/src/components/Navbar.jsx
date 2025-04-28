import { Link } from "react-router-dom"
import styles from "../styles/Navbar.module.css";

function Navbar() {
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
                <Link to="/login">Login</Link>
            </div>
        </nav>
    );
}

export default Navbar;