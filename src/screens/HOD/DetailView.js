import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { MessageCircle } from "lucide-react";
import LiveChat from "./LiveChat";
import styles from "./HOD styles/DetailView.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DetailView({ log, onBack, isSidebarOpen }) {
  const storedStatus =
    localStorage.getItem(`logStatus-${log?.id}`) ||
    log?.status?.toLowerCase() ||
    "open";

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [status, setStatus] = useState(storedStatus);
  const [, setIsProcessing] = useState(false);
  const [setSelectedImage] = useState(null);
  const [, setIsImageViewerOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(true);

  useEffect(() => {
    if (log?.id) {
      localStorage.setItem(`logStatus-${log.id}`, status);
    }
  }, [status, log?.id]);

  if (!log) {
    return <div className={styles["detail-view"]}>No log selected</div>;
  }

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleOpenPopup = (action) => {
    setActionType(action);
    setIsPopupVisible(true);
  };

  const handleOpenImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageViewerOpen(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (actionType === "reopen") {
        log.status = "PENDING";
        setStatus("pending");

        const response = await fetch(
          `https://localhost:44328/api/ManageLogs/OpenLog/${log.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        response.ok
          ? toast.success("✅ This issue has been re-opened!")
          : toast.error(`❌ Failed to reopen issue: ${data.message}`);
      }

      if (actionType === "close") {
        log.status = "CLOSED";
        setStatus("closed");

        const response = await fetch(
          `https://localhost:44328/api/ManageLogs/CloseLog/${log.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        response.ok
          ? toast.success(`✅ ${data.message}`)
          : toast.error(`❌ Failed to close issue: ${data.message}`);
      }
    } catch (error) {
      toast.error("❌ Network error occurred.");
    }

    setIsPopupVisible(false);
    setActionType(null);
    setIsProcessing(false);
  };

  const handleCancel = () => {
    setIsPopupVisible(false);
    setActionType(null);
  };

  return (
    <div
      className={`${styles["dashboard-container"]} ${
        isSidebarOpen ? styles["sidebar-open"] : styles["sidebar-closed"]
      }`}
    >
      <div className={styles["detail-header"]}>
        <h2>{log.issueTitle || log.issueId || "Untitled Log"}</h2>
        <div className={styles["header-actions"]}>
          <button
            className={styles["live-chat-button"]}
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle size={20} />
            <span>Live Chat</span>
          </button>
        </div>
      </div>
 {/* Department Dropdown */}
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

        {selectedDepartment && (
          <div className={styles["department-label"]}>
            <span>{selectedDepartment}</span>
          </div>
        )}

      <div className={styles["detail-content"]}>
        <div className={styles["issue-info"]}>
          <p>
            Issue ID:{" "}
            <span className={styles["user-name"]}>
              {log.issueId || "Unknown"}
            </span>
          </p>
          <p>
            Priority:{" "}
            <span
              className={`${styles["priority"]} ${
                styles[log.priority?.toLowerCase() || "default"]
              }`}
            >
              {log.priority || "Not Set"}
            </span>
          </p>
          <p>
            {log?.issuedAt && !isNaN(new Date(log.issuedAt).getTime())
              ? new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(log.issuedAt))
              : "Invalid Date"}
          </p>
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
              handleOpenImageViewer(
                `data:image/jpeg;base64,${log.attachmentBase64}`
              )
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

      <div className={styles["bottom-actions"]}>
        <button className={styles["back-button-d"]} onClick={onBack}>
          BACK
        </button>

        {/* {status !== "closed" && (
          <button
            className={styles["close-button"]}
            onClick={() => handleOpenPopup("close")}
          >
            Close Log
          </button>
        )}

        {status === "closed" && (
          <button
            className={styles["reopen-button"]}
            onClick={() => handleOpenPopup("reopen")}
          >
            Re-open Log
          </button>
        )} */}
      </div>

      {isChatOpen && <LiveChat onClose={() => setIsChatOpen(false)} />}

      {/* {isPopupVisible && (
        <div className={styles["popup-overlay"]}>
          <div className={styles["popup-content"]}>
            <h3>
              {actionType === "close"
                ? "Confirm Close Issue"
                : "Re-open Issue?"}
            </h3>
            <p>
              {actionType === "close"
                ? "By closing this issue, you acknowledge that the issue has been fully resolved and no further actions are needed. Proceed?"
                : "If you proceed, the logged issue will be re-opened and the assigned technician will be notified."}
            </p>
            <div className={styles["popup-buttons"]}>
              <button onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Proceed"}
              </button>
              <button onClick={handleCancel} disabled={isProcessing}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

DetailView.propTypes = {
  log: PropTypes.shape({
    id: PropTypes.string,
    issueId: PropTypes.string,
    issueTitle: PropTypes.string,
    description: PropTypes.string,
    issuedAt: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    department: PropTypes.string,
    attachmentBase64: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool,
};

export default DetailView;
