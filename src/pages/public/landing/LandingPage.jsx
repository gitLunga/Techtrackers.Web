import Header from "./Header.jsx";
import Home from "./Home.jsx";
import About from "./About.jsx";
import Services from "./Services.jsx";
import Contact from "./Contact.jsx";
import "./styles/landing.css";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <div className="main-contain">
        <div id="home">
          <Home />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="services">
          <Services />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </div>
    </div>
  );
}
