import React, { useState } from "react";
import PropTypes from "prop-types";
import { Paperclip, MoreVertical } from "lucide-react";
import EscalationPage from "./EscalationsAdmin"; // Import the EscalationPage component
import styles from "../SidebarCSS/DetailView.module.css";
import userAvatar from "../adminIcons/images/user.jpg";
import { toast, ToastContainer } from 'react-toastify';

function DetailView({ log, onBack }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(""); // State for department selection
  const [isEscalationVisible, setIsEscalationVisible] = useState(false); // State to control EscalationPage visibility
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(true); // State to control dropdown visibility

  const handleOpenPopup = (action) => {
    setActionType(action);
    setIsPopupVisible(true);
  };

  const handleConfirm = async () => {
    if (actionType === "reopen") {
      log.status = "PENDING"; // ✅ Instantly update UI to PENDING
      setIsPopupVisible(false);
      setActionType(null);
      // toast.success("✅ This issue has been re-opened! The technician has been notified.");

      try {
        const response = await fetch(`https://localhost:44328/api/ManageLogs/OpenLog/${log.logId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
      
        
        if (response.ok ) {
          toast.success("✅ This issue has been re-opened! The technician has been notified.");
          return;
        } else {
          toast.error(`❌ Failed to reopen issue: ${data.message}`);

        }

        // ✅ Status will remain "PENDING" until the technician resolves it
      } catch (error) {
        toast.error("❌ Network error! Could not reopen issue.");
      }
    }

    if (actionType === "close") {
      log.status = "CLOSED"; // ✅ Instantly update UI to CLOSED
      setIsPopupVisible(false);
      setActionType(null);
     

      try {
        const response = await fetch(`https://localhost:44328/api/ManageLogs/CloseLog/${log.logId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (response.ok ) {
          toast.success(`✅: ${data.message} `);
        }
      } catch (error) {
        toast.error("❌ Network error! Could not close issue.");
      }
    }

    setIsPopupVisible(false);
    setActionType(null);
    setIsConfirmed(true);
  };

  const handleCancel = () => {
    setIsPopupVisible(false);
    setActionType(null);
  };

  const handleOpenImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
    setSelectedImage(null);
  };

  const toggleEscalation = () => {
    setIsEscalationVisible((prevState) => !prevState); // Toggle the visibility of EscalationPage
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
    setIsDropdownVisible(false); // Hide dropdown after selection
  };

  const renderActionButtons = () => {
    if (log.status?.toLowerCase() === "closed") return null; // ✅ Instantly hide buttons

    return (
      <div className={styles["action-buttons"]}>
        <button className={styles["back-button-d"]} onClick={onBack}>BACK</button>

        {log.status?.toLowerCase() === "resolved" && (
          <button className={styles["reopen-button"]} onClick={() => handleOpenPopup("reopen")}>
            RE-OPEN
          </button>
        )}

        {log.status?.toLowerCase() !== "closed" && (
          <button className={styles["close-button"]} onClick={() => handleOpenPopup("close")}>
            CLOSE-LOG
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles["dashboard-container"]}>
      <div className={styles["detail-header"]}>
        <h2>{log.issueId}</h2>
        <div className={styles["header-actions"]}>
          {/* Department Dropdown (Visible) */}
          {isDropdownVisible && (
            <select
              className={styles["department-dropdown"]}
              value={selectedDepartment}
              onChange={handleDepartmentChange}
            >
              <option value="">Select Department</option>
              <option value="Facilities Management / Maintenance Department">
                Facilities Management / Maintenance Department
              </option>
              <option value="Technical Services / IT Support">
                Technical Services / IT Support
              </option>
              <option value="Engineering / Utilities Department">
                Engineering / Utilities Department
              </option>
              <option value="Security & Surveillance">
                Security & Surveillance
              </option>
              <option value="Customer Support / Helpdesk">
                Customer Support / Helpdesk
              </option>
              <option value="Logistics & Fleet Management">
                Logistics & Fleet Management
              </option>
              <option value="Housekeeping & Janitorial Services">
                Housekeeping & Janitorial Services
              </option>
            </select>
          )}

          {/* Display selected department as label */}
          {selectedDepartment && (
            <div className={styles["department-label"]}>
              <span> {selectedDepartment}</span>
            </div>

          )}

          <button className={styles["more-button"]} onClick={toggleEscalation}>
            <MoreVertical size={20} /> {isEscalationVisible ? "Back" : "More"}
          </button>
        </div>
      </div>

      <div className={styles["detail-content"]}>
        {isEscalationVisible ? (
          <EscalationPage logId={log.logId} /> // Render EscalationPage when isEscalationVisible is true
        ) : (
          <>
            {isConfirmed ? (
              <div
                className={styles["status-label"]}
                style={{ color: actionType === "close" ? "green" : "red" }}
              >
                <p>{statusMessage}</p>
                <div className={styles["issue-info"]}>
                  <div className={styles["issue-logged-by"]}>
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className={styles["avatar"]}
                    />
                    <div>
                      <p>Issue Logged By: {log.logBy}</p>
                    </div>
                  </div>
                  <div className={styles["issue-priority"]}>
                    <p>
                      Priority:{" "}
                      <span
                        className={`${styles["priority"]} ${styles[log.priority ? log.priority.toLowerCase() : ""]}`}
                      >
                        {log.priority}
                      </span>
                    </p>
                  </div>
                  <div className={styles["issue-date"]}>
                    <p>{new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(new Date(log.issuedAt))}</p>
                  </div>
                </div>

                <div className={styles["issue-location"]}>
                  <p>Department - {log.department}</p>
                  <p>Location - {log.location} </p>
                </div>
                <div className={styles["issue-status"]}>
                  <p>
                    Status:{" "}
                    <span className={`${styles["status"]} ${styles[log.status ? log.status.toLowerCase() : ""]}`}>
                      {log.status}
                    </span>
                  </p>

                  {log.status === "PENDING" && (
                    <p className={styles["pending-note"]}>
                      ⚠️ This issue will remain in <strong>PENDING</strong> status until the assigned technician resolves it.
                    </p>
                  )}
                </div>
                <div className={styles["description"]}>
                  <h3>Description</h3>
                  <p>{log.description}</p>
                </div>
                <button className={styles["back-button-d"]} onClick={onBack}>
                  BACK
                </button>
              </div>
            ) : (
              <>
                <div className={styles["issue-info"]}>
                  <div className={styles["issue-logged-by"]}>
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className={styles["avatar"]}
                    />
                    <div className={styles["logged-by"]}>
                      <p>Issue Logged By: {log.logBy}</p>
                    </div>
                  </div>
                  <div className={styles["issue-priority"]}>
                    <p>
                      Priority:{" "}
                      <span
                        className={`${styles["priority"]} ${styles[log.priority ? log.priority.toLowerCase() : ""]}`}
                      >
                        {log.priority}
                      </span>
                    </p>
                  </div>
                  <div className={styles["issue-date"]}>
                    <p>
                      {log?.issuedAt && !isNaN(new Date(log.issuedAt).getTime())
                        ? new Intl.DateTimeFormat("en-US", {
                          dateStyle: "long",
                          timeStyle: "short",
                        }).format(new Date(log.issuedAt))
                        : "Invalid Date"}
                    </p>
                  </div>
                </div>
                <div className={styles["issue-location"]}>
                  <p>Department - {log.department}</p>
                  <p>Location - {log.location} </p>
                </div>

                <div className={styles["issue-description"]}>
                  <h3>Description</h3>
                  <p>{log.description}</p>
                </div>
                <div className={styles["issue-attachments"]}>
                  <h3>
                    <Paperclip className={styles["icon"]} />
                    Attachments
                  </h3>
                  {log.attachmentBase64 ? (
                    <div
                      className={styles["attachment"]}
                      onClick={() => handleOpenImageViewer(`data:image/jpeg;base64,${log.attachmentBase64}`)}
                    >
                      <img
                        src={`data:image/jpeg;base64,${log.attachmentBase64}`}
                        alt="Uploaded Attachment"
                      />
                      <span>Uploaded Image</span>
                    </div>
                  ) : (
                    <p>No attachments available.</p>
                  )}
                </div>
                <div className={styles["issue-status"]}>
                  <p>
                    Status:{" "}
                    <span
                      className={`${styles["status"]} ${styles[log.status ? log.status.toLowerCase() : ""]}`}
                    >
                      {log.status}
                    </span>
                  </p>
                </div>

                {renderActionButtons()}
              </>
            )}
          </>
        )}
      </div>

      {isPopupVisible && (
        <div className={styles["popup"]}>
          <div className={styles["popup-content"]}>
            <h3>
              {actionType === "reopen" ? "Re-open Issue?" : "Confirm Close Issue"}
            </h3>
            <p>
              {actionType === "reopen"
                ? "If you proceed, the logged issue will be re-opened and the assigned technician will be notified."
                : "By closing this issue, you acknowledge that the issue has been fully resolved and no further actions are needed. Proceed?"}
            </p>
            <div className={styles["popup-buttons"]}>
              <button onClick={handleConfirm}>Proceed</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}


      {/* Image Viewer */}
      {isImageViewerOpen && selectedImage && (
        <div className={styles["image-viewer"]}>
          <div className={styles["image-viewer-content"]}>
            <button onClick={handleCloseImageViewer}>Close</button>
            <img src={selectedImage} alt="Attachment" />
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

DetailView.propTypes = {
  log: PropTypes.shape({
    logId: PropTypes.number.isRequired,
    issueId: PropTypes.string.isRequired,
    logBy: PropTypes.string.isRequired,
    priority: PropTypes.string,
    issuedAt: PropTypes.string,
    department: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    attachmentBase64: PropTypes.string,
    status: PropTypes.string,
    location: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default DetailView;
