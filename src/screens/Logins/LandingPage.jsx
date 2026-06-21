import Header from './Header';
import HomePage from './HomePage';
import Service from './Service';
import Contact from './Contact';
import Login from './SignIn';
import About from './About';
import "./LoginsStyle/LandingPage.css";

const Main = () => {
    return (
      <div>
        <div className="main-contain">
        <div id="home">
          <HomePage />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="services">
          <Service />
        </div>
        <div id="login">
          <Login />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </div>
    </div>
    );
  };
  
  export default Main;