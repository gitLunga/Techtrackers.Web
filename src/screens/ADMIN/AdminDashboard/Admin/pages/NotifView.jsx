import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../SidebarCSS/NotifView.module.css";
import profIcon from "../adminIcons/profile.png";

const NotifView = () => {
  const navigate = useNavigate();
  const { state: notification } = useLocation(); // Retrieve notification data from route state

  // Retrieve the logged-in user's details from localStorage
  const userInfo = JSON.parse(localStorage.getItem("user_info"));
  const userName = userInfo ? userInfo.userName : "Unknown User"; // Assuming userName is stored in localStorage

  // Handle the Back button click
  const handleBack = () => {
    navigate(-1); // Redirect back to the previous page
  };

  // Check if the notification data is available
  if (!notification) {
    return <div className={styles.error}>Notification data not found.</div>;
  }

  // Determine the color of the status value
  const statusColor =
    notification.status === "RESOLVED"
      ? "green"
      : notification.status === "IN PROGRESS"
      ? "goldenrod"
      : "black"; // Default color

  return (
    <div className={styles.issueDetailsContainer}>
      {/* Issue Status */}
      <div className={styles.issue}>
        <h2>
          Status:{" "}
          <span style={{ color: statusColor }}>{notification.status}</span>
        </h2>
      </div>

      {/* Notification Details Header */}
      <div className={styles.issueHeader}>
        {/* Requested By */}
        <div className={styles.issueRequestor}>
          {/* <p>Requested By:</p> */}
          <div className={styles.profile}>
            <img src={profIcon} width="50" height="50" alt="Profile Icon" />
            <p className={styles.name}>{userName}</p> {/* Display the name from localStorage */}
          </div>
          <div className={styles.issueInfo}>
            {/* <p className={styles.prio}>
              Issue Created By: {notification.createdBy} 
            </p> */}
            <p className={styles.issueDate}>Time Received: {new Date(notification.timestamp).toLocaleDateString()} {new Date(notification.timestamp).toLocaleTimeString()}</p><br />
            <p className={styles.notificationType}>Notification Type: {notification.type}</p> {/* Display the notification type */}
          </div>
        </div>
      </div>

      {/* Full Notification Message */}
      <div className={styles.notificationMessage}>
        <h3>Message</h3>
        <p>{notification.message}</p> {/* Display the full message */}
      </div>

      {/* Back Button */}
      <div className={styles.actions}>
        <button className={styles.closeButton} onClick={handleBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default NotifView;
