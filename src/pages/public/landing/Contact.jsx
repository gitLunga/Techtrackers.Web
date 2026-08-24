import { useState } from "react";
import messageIcon from "../../../Images/message.jpg";
import locationIcon from "../../../Images/location.jpg";
import phoneIcon from "../../../Images/phone.jpg";
import "./styles/contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title animate-fade-in">Contact Us</h1>
      <div className="content">
        <form className="contact-form animate-slide-in-left" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Your name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Your valid email address"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              className="textareas form-input"
              placeholder="Message"
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="contact-button">
            Submit
          </button>
        </form>

        <div className="contact-details animate-slide-in-right">
          <div className="contact-item">
            <img src={messageIcon} alt="Chat" className="contact-image" />
            <div className="contact-message">
              <p>
                Chat to us
                <br />
                Our friendly team is here to help: <span className="color-email">help@fixflow.com</span>
              </p>
            </div>
          </div>

          <div className="contact-item">
            <img src={locationIcon} alt="Location" className="contact-image" />
            <div className="contact-message">
              <p>
                Office location
                <br />
                Soshanguve Campus, Building 10
              </p>
            </div>
          </div>

          <div className="contact-item">
            <img src={phoneIcon} alt="Phone" className="contact-image" />
            <div className="contact-message">
              <p>
                Call us
                <br />
                012 985 9636
                <br />
                Mon-Fri from 8am-4pm
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="footer animate-fade-in">
        <span>© Copyright FixFlow All Rights Reserved</span>
      </div>
    </div>
  );
};

export default Contact;
