import { useState, useEffect } from "react";
import { Link as ScrollLink } from 'react-scroll'; // Correct import for react-scroll
import "../Logins/LoginsStyle/header.css";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Check if the user is on the sign-in page
  const isSignInPage = location.pathname === "/login";

  return (
    <div id="header" className={scrolled ? "header-scrolled" : ""}>
      <nav className="navbar">
        <div className="navbar-brand">
          <img
            src={require("../../Images/tut.png")}
            alt="logo"
            className="logos"
            height={70}
            onClick={() => navigate("/")}
          />
        </div>

        {!isSignInPage && ( // Show these links only if NOT on sign-in page
          <>
            <div className="hamburger-menu" onClick={toggleMenu}>
              <span className="hamburger-icon">&#9776;</span>
            </div>

            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
              <ScrollLink
                to="home"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/");
                }}
              >
                Home
              </ScrollLink>
              <ScrollLink
                to="about"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => setMenuOpen(false)}
              >
                About
              </ScrollLink>
              <ScrollLink
                to="services"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => setMenuOpen(false)}
              >
                Service
              </ScrollLink>
              <ScrollLink
                to="login"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </ScrollLink>
              <ScrollLink
                to="contact"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </ScrollLink>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

export default Header;
