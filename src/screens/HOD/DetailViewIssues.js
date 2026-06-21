import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Paperclip, MessageCircle } from "lucide-react";
import LiveChat from "./LiveChat";
import styles from "./HOD styles/DetailView.module.css";

function DetailView({ log, onBack, isSidebarOpen }) {
  const storedStatus = localStorage.getItem(`logStatus-${log?.id}`) || log?.status?.toLowerCase() || "open";
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [status, setStatus] = useState(storedStatus);

  useEffect(() => {
    if (log?.id) {
      localStorage.setItem(`logStatus-${log.id}`, status);
    }
  }, [status, log?.id]);

  if (!log) {
    return <div className={styles["detail-view"]}>No log selected</div>;
  }

  const handleOpenPopup = (action) => {
    setActionType(action);
    setIsPopupVisible(true);
  };

  const handleConfirm = () => {
    if (actionType === "close") {
      setStatus("closed");
      setToastMessage("This issue has been closed!");
    } else if (actionType === "reopen") {
      setStatus("open");
      setToastMessage("This issue has been re-opened!");
    }
    setIsPopupVisible(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleCancel = () => {
    setIsPopupVisible(false);
  };

  return (
    <div
      className={`${styles["dashboard-container"]} ${
        isSidebarOpen ? styles["sidebar-open"] : styles["sidebar-closed"]
      }`}
    >
      <div className={styles["detail-header"]}>
        <h2>{log.title || "Untitled Log"}</h2>
      </div>

      <div className={styles["detail-content"]}>
        <div className={styles["issue-info"]}>
          <p>Assigned to: <span className={styles["user-name"]}>{log.assigned || "Unknown"}</span></p>
          <p>
            Priority:{" "}
            <span className={`${styles["priority"]} ${styles[log.priority?.toLowerCase() || "default"]}`}>
              {log.priority || "Not Set"}
            </span>
          </p>
          <p>{log.date || "Date not available"}</p>
        </div>

        <p>Department: {log.department || "Building 18"}</p>

        <p>
          Status:{" "}
          <span className={`${styles.status} ${styles[`status${status}`]}`}>
  {status}
</span>
        </p>

        <h3>Description</h3>
        <p>{log.description || "No description provided."}</p>

      <h3>Attachment</h3>
{log.attachmentBase64 ? (
  <div
    className={styles["attachment"]}
    onClick={() =>
      handleOpenImageViewer(`data:image/jpeg;base64,${log.attachmentBase64}`)
    }
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

      {/* Live Chat Component */}
      {isChatOpen && <LiveChat onClose={() => setIsChatOpen(false)} />}

      {/* Close Button */}
      <div className={styles["close-button-container"]}>
        <button className={styles["close-button"]} onClick={onBack}>
          Close
        </button>
      </div>
    </div>
  );
}

DetailView.propTypes = {
  log: PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    department: PropTypes.string,
    assigned: PropTypes.string,
    title: PropTypes.string,
    attachments: PropTypes.arrayOf(
     PropTypes.shape({
        filename: PropTypes.string,
        imageUrl: PropTypes.string,
      })
    ),
  }),
  onBack: PropTypes.func.isRequired,
};

export default DetailView;
