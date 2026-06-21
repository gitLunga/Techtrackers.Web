import React, { useState } from "react";
import styles from './ManageLogs.module.css';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const IssueRow = ({ log, onSelect }) => {
  const [action, setAction] = useState("Action");
  const [status, setStatus] = useState(log.status);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [actionType, setActionType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleActionSelect = (newAction) => {
    if (newAction === "Open") {
      setActionType("reopen");
    } else if (newAction === "Closed") {
      setActionType("close");
    }
    setAction(newAction);
    setDropdownOpen(false);
    setPopupVisible(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    if (actionType === "reopen") {
      log.status = "PENDING";
      setStatus("pending");
      setPopupVisible(false);
      setActionType(null);

      try {
        const response = await fetch(
          `https://localhost:44328/api/ManageLogs/OpenLog/${log.logId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        if (response.ok) {
          toast.success("✅ This issue has been re-opened! The technician has been notified.");
        } else {
          toast.error(`❌ Failed to reopen issue: ${data.message}`);
        }
      } catch (error) {
        toast.error("❌ Network error! Could not reopen issue.");
      }
    }

    if (actionType === "close") {
      log.status = "CLOSED";
      setStatus("closed");
      setPopupVisible(false);
      setActionType(null);

      try {
        const response = await fetch(
          `https://localhost:44328/api/ManageLogs/CloseLog/${log.logId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        if (response.ok) {
          toast.success(`✅: ${data.message}`);
        } else {
          toast.error(`❌ Failed to close issue: ${data.message}`);
        }
      } catch (error) {
        toast.error("❌ Network error! Could not close issue.");
      }
    }

    setIsProcessing(false); // Reset processing state
  }; // ← ✅ This closing brace was missing

  const handleCancel = () => {
    setPopupVisible(false);
    setIsProcessing(false);
  };

  return (
    <>
      <tr>
        <td>{log.issueId}</td>
        <td>{log.issueTitle}</td>
        <td>{log.priority}</td>
        <td>{log.assignedTo}</td>
        <td>{new Date(log.issuedAt).toLocaleDateString()}</td>
       <td>
  <div className={styles["button-group"]}>
    <button className={styles["view-button"]} onClick={onSelect}>
      View
    </button>

    <div className={styles["action-dropdown"]}>
      <button
        className={styles["action-button"]}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        {action} ▼
      </button>

      {isDropdownOpen && (
        <div className={styles["dropdown-menu"]}>
          <button onClick={() => handleActionSelect("Open")}>Re-open</button>
          <button onClick={() => handleActionSelect("Closed")}>Closed</button>
        </div>
      )}
    </div>
  </div>
</td>

      </tr>

      {isPopupVisible && (
        <div className={styles["popup-overlay"]}>
          <div className={styles["popup-content"]}>
            <h3>
              {actionType === "close" ? "Confirm Close Issue" : "Re-open Issue?"}
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
      )}

      <ToastContainer />
    </>
  );
};

export default IssueRow;
