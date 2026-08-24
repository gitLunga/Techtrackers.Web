import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../../Images/tut.png";
import "./styles/header.css";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isSignInPage = location.pathname === "/login";

  return (
    <div id="header" className={scrolled ? "header-scrolled" : ""}>
      <nav className="navbar">
        <div className="navbar-brand">
          <img
            src={logo}
            alt="logo"
            className="logos"
            height={70}
            onClick={() => navigate("/")}
          />
        </div>

        {!isSignInPage && (
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
              <Link to="/login" className="nav_button" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
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
