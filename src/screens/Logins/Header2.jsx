import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ScrollLink } from 'react-scroll'; // Correct import for react-scroll
import styles from"../Logins/LoginsStyle/Header2.module.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();


  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div id={styles.header} className={styles.headerScrolled}>
      <nav className="navbar">
        <div className={styles.navbarBrand}>
          <img
            src={require("../../Images/tut.png")}
            alt="logo"
            className={styles.logos}
            height={70}
            onClick={() =>navigate("/")}
          />
        </div>

        <div className={styles.hamburgerMenu} onClick={toggleMenu}>
          <span className={styles.hamburgerIcon}>&#9776;</span> {/* Hamburger icon */}
        </div>

        <div className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
          
          <button
            className={styles.navButton} 
            onClick={() =>navigate("/")}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className={styles.navButton}
          >
            Login
          </button>
          
        </div>
      </nav>
    </div>
  );
}

export default Header;
