import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "../SidebarCSS/IssueDetailsCollaburationRequest.module.css";
import descIcon from "../images/descCollaborationRequest.png";
import attachIcon from "../images/attachmeCollaborationRequest.png";
import profIcon from "../images/profileCollaborationRequest.png";
import image from "../images/imageCollaborationRequest.png";
import chat from "../images/chatCollaborationRequest.png";
import acceptIcon from "../images/acceptIcon.png";
import { toast } from 'react-toastify';
import declineIcon from "../images/declineIcon.png";

// Popup component for displaying message
const Popup = ({ message, onClose }) => {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <p>{message}</p>
        <button className={styles.popupClose} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const IssueDetails = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { state: issue } = useLocation(); // Retrieve issue data from route state
  const [popupMessage, setPopupMessage] = useState(""); // State for popup message visibility

  // Handle the Close button click
  const handleClose = () => {
    navigate("/techniciandashboard/collab"); // Navigate back to the table route
  };

  const handleRespondToCollab = async (collaborationId, status) => {
    try {
      const response = await fetch(`https://localhost:44328/api/Collaboration/Respond/${collaborationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
  
      if (response.ok) {
        toast.success("Collaboration response updated!");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update collaboration.");
      }
    } catch (error) {
      toast.error("An error occurred while updating collaboration.");
    }
  };

  const handleChat = () => {
    navigate("/techniciandashboard/techChat");
  };

  // Handle Accept button click
  const handleAccept = () => {
    setPopupMessage("Collaboration Accepted");
  };

  // Handle Decline button click
  const handleDecline = () => {
    setPopupMessage("Collaboration Declined");
  };

  // Popup component for displaying accept/decline messages with icons
  const Popup = ({ message, onClose }) => (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <p>
          {message.includes("Accept") ? (
            <>
              <img src={acceptIcon} alt=" Accept Icon" width="25" height="25" />
              {message}
            </>
          ) : (
            <>
              <img src={declineIcon} alt=" Decline Icon" width="25" height="25" />
              {message}
            </>
          )}
        </p>
        <button className={styles.popupClose} onClick={onClose}>Close</button>
      </div>
    </div>
  );

  // Check if the issue data is available
  if (!issue) {
    return <div>Issue not found or data missing.</div>;
  }

  return (
    <div className={styles.issueDetailsContainer}>
      {/* Issue Title */}
      <div className={styles.issue}>
        <h2>Issue Title: {issue.issueTitle}</h2>
        <a href="">
          <img src={chat} width="40" height="40" alt="Chat Icon" onClick={handleChat}/>
        </a>
      </div>

      {/* Header Section */}
      <div className={styles.issueHeader}>
        {/* Requestor Info */}
        <div className={styles.issueRequestor}>
          <p>Requested By:</p>
          <div className={styles.profile}>
            <img src={profIcon} width="40" height="40" alt="Profile Icon" />
            <p className={styles.name}>{issue.name}</p>
          </div>
          <div className={styles.issueInfo}>
            <p className={styles.prio}>Date: {issue.date}</p>
            <p className={styles.issueDate}>Time: {issue.time}</p>
          </div>
        </div>

        {/* Issue Date and Time */}
      </div>

      <div className={styles.issueDetails}>
        <h3>
          <h4><img src={descIcon} width="25" height="30" alt="Description Icon"/> Description</h4>
        </h3>
        <p className={styles.descriptionText}>
        {issue.Description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
          <div className={styles.collabBtns}>
            <button className={styles.acceptButton} onClick={handleAccept}>Accept</button>
            <button className={styles.declineButton} onClick={handleDecline}>Decline</button>
          </div>
          <button className={styles.closeButton2} onClick={handleClose}>
          Close
        </button>
      </div>  
      {/* Popup for showing accept or decline messages */}
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage("")} />}

    </div>
  );
};

export default IssueDetails;
