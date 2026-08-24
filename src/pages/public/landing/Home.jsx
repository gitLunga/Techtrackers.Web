import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/homepage.css";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-container">
      <div className={`hero-content ${isLoaded ? "animate-slide-up" : ""}`}>
        <div className="first-title">
          <p>
            Your First Step to Seamless
            <br />
            Resolutions.
          </p>
        </div>
        <div className="second-title">
          <p>
            Ensure that every technical problem is handled effortlessly. Keep your work
            <br />
            environment running smoothly.
          </p>
        </div>
        <div className="home-button">
          <Link to="/login">
            <button className="start-button">Get Started</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
