import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import service1 from "../../../Images/service1.jpg";
import service2 from "../../../Images/service2.jpg";
import service3 from "../../../Images/service3.jpg";
import service4 from "../../../Images/service4.jpg";
import "./styles/service.css";

const Services = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="service-container">
      <h1 className="under">SERVICES</h1>
      <p className="centered-text">
        FixFlow offers a comprehensive suite of services designed to streamline technical support across your
      </p>
      <p className="centered-text">
        organization. From issue logging to resolution tracking, our platform ensures that every technical challenge
      </p>
      <p className="centered-text">is handled efficiently.</p>

      <Slider {...settings} className="images-container">
        <div className="image-item">
          <img src={service1} alt="Service 1" className="service-image" />
          <p className="image-caption">Issue Logging and Reporting</p>
          <p className="centered-caption">Easily log and report technical issues</p>
          <p className="centered-caption">through a user-friendly form.</p>
        </div>
        <div className="image-item">
          <img src={service2} alt="Service 2" className="service-image" />
          <p className="image-caption">Technician Assignment</p>
          <p className="centered-caption">Get the right technicians based on their</p>
          <p className="centered-caption">expertise.</p>
        </div>
        <div className="image-item">
          <img src={service3} alt="Service 3" className="service-image" />
          <p className="image-caption">Real-Time Issue Tracking</p>
          <p className="centered-caption">Track the status of reported</p>
          <p className="centered-caption">issues in real-time, with updates</p>
          <p className="centered-caption">provided at every stage of the</p>
          <p className="centered-caption">resolution process.</p>
        </div>
        <div className="image-item">
          <img src={service4} alt="Service 4" className="service-image" />
          <p className="image-caption">Collaborations</p>
          <p className="centered-caption">Collaborate in real-time, sharing insights</p>
          <p className="centered-caption">and working together to resolve issues</p>
          <p className="centered-caption">more efficiently.</p>
        </div>
      </Slider>
    </div>
  );
};

export default Services;
