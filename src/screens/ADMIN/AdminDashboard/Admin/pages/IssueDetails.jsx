import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../SidebarCSS/IssueDetails.module.css"; // Import the CSS module
import descIcon from "../adminIcons/desc.png";
import attachIcon from "../adminIcons/attachme.png";
import profIcon from "../adminIcons/profile.png";
import image from "../adminIcons/image.png";
import dots from "../adminIcons/dots.png";
import LiveChat from "./LiveChat"; // Ensure LiveChat is imported correctly

const IssueDetails = ({ issues }) => {
  const { issueId } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  const issue = issues.find((i) => i.issueId === issueId);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCloseLiveChat = () => {
    setIsChatOpen(false);
  };

  if (!issue) {
    return <div>Issue not found</div>;
  }

  // Handle the Close button click
  const handleClose = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className={styles.issueDetailsContainer}>
      {/* Issue Title */}
      <div className={styles.issue}>
        <h2>Internal Issue: {issue.title}</h2>
        <div className={styles.rightHeader}>
          <button className={styles.chatButton} onClick={() => setIsChatOpen(!isChatOpen)}>
            Chat
          </button>
          <button
            className={styles.moreButton}
            onClick={() => setIsChatOpen(true)}
          >
            <img src={dots} width="3" height="18" alt="More" />
            More
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className={styles.issueHeader}>
        {/* Requestor Info */}
        <div className={styles.issueRequestor}>
          <p>Invite Requested By:</p>
          <div className={styles.profile}>
            <img src={profIcon} width="50" height="50" alt="Profile Icon" />
            <p className={styles.name}>{issue.name}</p>
          </div>
          <p className={styles.issueId}>{issue.issueId}</p>
        </div>

        {/* Issue Priority and Date */}
        <div className={styles.issueInfo}>
          <div className={styles.prio}>
            <p>
              Priority:{" "}
              <span
                className={`${styles.priorityText} ${
                  issue.priority === "High"
                    ? styles.priorityHigh
                    : issue.priority === "Medium"
                    ? styles.priorityMedium
                    : styles.priorityLow
                }`}
              >
                {issue.priority.toUpperCase()}
              </span>
            </p>
          </div>
          <p className={styles.issueDate}>{issue.date}</p>
        </div>
      </div>

      {/* Issue Description */}
      <div className={styles.issueDetails}>
        <h3>
          <img src={descIcon} width="25" height="30" alt="Description Icon" />
          <h4>Description</h4>
        </h3>
        <p className={styles.descriptionText}>
          {issue.description || "No description available."}
        </p>
      </div>

      {/* Attachments Section */}
      {issue.attachmentUrl && (
        <div className={styles.attachments}>
          <h3>
            <img src={attachIcon} width="15" height="25" alt="Attachment Icon" />
            <h4>Attachments</h4>
          </h3>
          <div className={styles.attachment}>
            {/* If the attachment is an image, render it as an image */}
            {issue.attachmentUrl.type && issue.attachmentUrl.type.startsWith("image") ? (
              <img
                src={URL.createObjectURL(issue.attachmentUrl)}
                alt="Uploaded attachment"
                width="100"
                height="100"
              />
            ) : (
              <a
                href={URL.createObjectURL(issue.attachmentUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {issue.attachmentUrl.name}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className={styles.additionalInfo}>
        <p>Department - {issue.department}</p>
        <p>Building 18 - 2nd Floor</p>
      </div>

      {/* Issue Status */}
      <div className={styles.status}>
        <p>
          Status:{" "}
          <span
            className={`${styles.statusText} ${issue.status.toLowerCase()}`}
          >
            {issue.status}
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.acceptButton}>Accept</button>
        <button className={styles.declineButton}>Decline</button>
        <button className={styles.closeButton} onClick={handleClose}>
          Close
        </button>
      </div>

      {/* Conditionally Render Live Chat */}
      {isChatOpen && <LiveChat onClose={handleCloseLiveChat} />}
    </div>
  );
};

export default IssueDetails;
