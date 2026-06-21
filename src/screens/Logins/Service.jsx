import React from 'react';
import Header from './Header'; 
import Slider from "react-slick"; // Corrected the component name
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../Logins/LoginsStyle/service.css";

const Service = () => {
  const settings = {
    dots: true, // Shows navigation dots
    infinite: true, // Infinite scrolling
    speed: 500, // Transition speed
    slidesToShow: 4, // Number of slides visible
    slidesToScroll: 1, // Number of slides to scroll
    autoplay: true, // Auto-scroll
    autoplaySpeed: 5000, // Time in milliseconds
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2, // Show 2 slides on medium screens
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1, // Show 1 slide on smaller screens
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div>
      <Header /> {/* Included Header component */}
      <div className="service-container">
        <h1 className="under">SERVICES</h1>
        <p className="centered-text">
          FixFlow offers a comprehensive suite of services designed to streamline technical support across your
        </p>
        <p className="centered-text">
          organization. From issue logging to resolution tracking, our platform ensures that every technical challenge
        </p>
        <p className="centered-text">is handled efficiently.</p>

        <Slider {...settings} className="images-container"> {/* Fixed Slider usage */}
          <div className="image-item">
            <img src={require('../../Images/service1.jpg')} alt="Service 1" className="service-image" />
            <p className="image-caption">Issue Logging and Reporting</p>
            <p className="centered-caption">Easily log and report technical issues</p>
            <p className="centered-caption">through a user-friendly form.</p>
          </div>
          <div className="image-item">
            <img src={require('../../Images/service2.jpg')} alt="Service 2" className="service-image" />
            <p className="image-caption">Technician Assignment</p>
            <p className="centered-caption">Get the right technicians based on their</p>
            <p className="centered-caption">expertise.</p>
          </div>
          <div className="image-item">
            <img src={require('../../Images/service3.jpg')} alt="Service 3" className="service-image" />
            <p className="image-caption">Real-Time Issue Tracking</p>
            <p className="centered-caption">Track the status of reported</p>
            <p className="centered-caption">issues in real-time, with updates</p>
            <p className="centered-caption">provided at every stage of the</p>
            <p className="centered-caption">resolution process.</p>
          </div>
          <div className="image-item">
            <img src={require('../../Images/service4.jpg')} alt="Service 4" className="service-image" />
            <p className="image-caption">Collaborations</p>
            <p className="centered-caption">Collaborate in real-time, sharing insights</p>
            <p className="centered-caption">and working together to resolve issues</p>
            <p className="centered-caption">more efficiently.</p>
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default Service;
