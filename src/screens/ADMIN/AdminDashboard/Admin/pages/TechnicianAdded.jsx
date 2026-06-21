import React from "react";

import "../SidebarCSS/technicianAddedStyles.css";
import checkCircle from "../adminIcons/images/checkCircle.png";
import { useNavigate } from "react-router-dom";

const TechnicianAdded = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate("/admindashboard/dashboard");
  };

  return (
    <div className="success-container">
      <div className="success-content">
        <h1 className="success-message">Technician Successfully Added!</h1>
        <img
          src={checkCircle}
          alt="Successfully Added Technician Icon"
          className="icon"
        />
        <div className="mt-4">
          <button
            type="button"
            className="btn btn-danger btn-cancel"
            onClick={handleExit}
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianAdded;
