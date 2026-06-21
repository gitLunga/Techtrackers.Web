import React, { useState, useEffect } from "react";
import "../SidebarCSS/escalations.css";
import checkedIcon from "../adminIcons/images/checkedIcon.png";
import incompleteIcon from "../adminIcons/images/incompleteIcon.png";

const Escalations = ({ logId }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [countdown, setCountdown] = useState({ response: 0, resolution: 0 });
  const [escalationLevel, setEscalationLevel] = useState(0);
  const [logStatus, setLogStatus] = useState("PENDING"); // Default status
  const [logDetails, setLogDetails] = useState(null); // Store log details
  const [firstReplyGiven, setFirstReplyGiven] = useState(false); // Track if first reply is given

  // Fetch log details from localStorage
  useEffect(() => {
    if (!logId) {
      console.error("Log ID is missing.");
      return;
    }

    const adminLogs = JSON.parse(localStorage.getItem("Admin Logs")) || [];
    const currentLog = adminLogs.find(log => log.logId === logId);

    if (currentLog) {
      setLogDetails(currentLog);
      setLogStatus(currentLog.status || "PENDING"); // Set log status from localStorage

      // Check if the status has changed from PENDING
      if (currentLog.status !== "PENDING") {
        setFirstReplyGiven(true); // First reply is given
      }
    } else {
      console.error("Log not found in Admin Logs.");
    }
  }, [logId]);

  // Fetch escalation data from API
  useEffect(() => {
    if (!logId) {
      console.error("Log ID is missing.");
      return;
    }

    const fetchEscalationData = async () => {
      try {
        const response = await fetch(`https://localhost:44328/api/Log/GetEscalationResults?logId=${logId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched Escalation Data:", data);

        setCountdown({
          response: data.responseDueInSeconds,
          resolution: data.resolutionDueInSeconds,
        });
        setEscalationLevel(data.escalationLevel);
      } catch (error) {
        console.error("Error fetching escalation data:", error);
      }
    };

    fetchEscalationData();

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => ({
        response: Math.max(prevCountdown.response - 1, 0),
        resolution: Math.max(prevCountdown.resolution - 1, 0),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [logId]);

  // Map log status to progress percentage
  const getProgressPercentage = (status) => {
    switch (status) {
      case "PENDING":
        return 25; // 25% for Pending
      case "INPROGRESS":
        return 50; // 50% for In Progress
      case "RESOLVED":
        return 100; // 100% for Resolved
      case "ESCALATED":
        return 100; // 100% for Escalated
      case "CLOSED":
        return 100;
      default:
        return 0; // Default to 0%
    }
  };

  // Get progress bar color based on log status
  const getProgressBarColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#ffcc00"; // Yellow for Pending
      case "INPROGRESS":
        return "#007bff"; // Blue for In Progress
      case "RESOLVED":
        return "#28a745"; // Green for Resolved
      case "ESCALATED":
        return "#ff0000"; // Red for Escalated
      case "CLOSED":
         return "#48494B";
      default:
        return "#0C4643"; // Default color
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 0) {
      return "Deadline Missed";
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}H ${m}M ${s}S`;
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="container-fluid bg-light p-3">
      {/* Header Section */}
      <div className="header">
        <div className="issue-info">
          <p>Issue ID: {logId}</p>
          <p>Created On: {logDetails?.issuedAt || "N/A"}</p>
          <p>Created By: {logDetails?.logBy || "N/A"}</p>
        </div>
        {/* SLA Countdown and Escalation Level */}
        <div className="sla-escalation">
          <h4>Escalation Level: {escalationLevel}</h4>
          <div>Response Due In: {formatTime(countdown.response)}</div>
          <div>Resolution Due In: {formatTime(countdown.resolution)}</div>
        </div>
      </div>

      {/* Status Section */}
      <div className="status-section">
        <h2 className="status-label">Issue Progress:</h2>
        <div className="progress-container">
          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${getProgressPercentage(logStatus)}%`,
                backgroundColor: getProgressBarColor(logStatus), // Dynamic color
              }}
            ></div>
          </div>

         {/* Progress Steps */}
<div className="progress-steps">
  <div className={`step ${logStatus === "PENDING" ? "active" : ""}`}>
    <img
      src={logStatus === "PENDING" ? checkedIcon : incompleteIcon}
      alt={logStatus === "PENDING" ? "Completed" : "Incomplete"}
    />
    <h5>Pending</h5>
  </div>

  <div className={`step ${logStatus === "INPROGRESS" ? "active" : ""}`}>
    <img
      src={logStatus === "INPROGRESS" ? checkedIcon : incompleteIcon}
      alt={logStatus === "INPROGRESS" ? "Completed" : "Incomplete"}
    />
    <h5>In Progress</h5>
  </div>

  <div className={`step ${logStatus === "RESOLVED" ? "active" : ""}`}>
    <img
      src={logStatus === "RESOLVED" ? checkedIcon : incompleteIcon}
      alt={logStatus === "RESOLVED" ? "Completed" : "Incomplete"}
    />
    <h5>Resolved</h5>
  </div>

  {/* Conditionally render Escalated step */}
  {logStatus === "ESCALATED" && (
    <div className="step active">
      <img src={checkedIcon} alt="Completed" />
      <h5>Escalated</h5>
    </div>
  )}

  {/* Conditionally render Closed step */}
  {logStatus === "CLOSED" && (
    <div className="step active">
      <img src={checkedIcon} alt="Completed" />
      <h5>Closed</h5>
    </div>
  )}
  
</div> 

      {/* Tabs Section */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => handleTabClick("summary")}
        >
          Summary
        </button>
        <button
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => handleTabClick("details")}
        >
          Details
        </button>
        <button
          className={`tab ${activeTab === "related" ? "active" : ""}`}
          onClick={() => handleTabClick("related")}
        >
          Related
        </button>
      </div>

      {/* Case Details Section */}
      {activeTab === "summary" && (
        <div className="case-details">
          <div className="card">
            <h4>Additional Case Details</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td>Main Issue</td>
                  <td>{logDetails?.issueTitle || "---"}</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>{logDetails?.category || "---"}</td>
                </tr>
                <tr>
                  <td>Raised</td>
                  <td>{logDetails?.issuedAt || "---"}</td>
                </tr>
                <tr>
                  <td>Escalated At</td>
                  <td>{logDetails?.escalatedAt || "---"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* First Response In Section */}
          <div className="card">
            <h4>First Response In:</h4>
            <div className="response-time">
              <img src={checkedIcon} alt="Completed" />
              <h2>{formatTime(countdown.response)}</h2>
            </div>
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div className="case-details">
          <div className="card">
            <h4>Additional Case Details</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td>Main Issue</td>
                  <td>{logDetails?.issueTitle || "---"}</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>{logDetails?.category || "---"}</td>
                </tr>
                <tr>
                  <td>Raised</td>
                  <td>{logDetails?.issuedAt || "---"}</td>
                </tr>
                <tr>
                  <td>Escalated At</td>
                  <td>{logDetails?.escalatedAt || "---"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Escalations Section */}
          <div className="card">
            <h4>Escalations</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td>First Reply Given</td>
                  <td>{firstReplyGiven ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>Follow-Up Action</td>
                  <td>----</td>
                </tr>
                <tr>
                  <td>First Reply Due</td>
                  <td>----</td>
                </tr>
                <tr>
                  <td>Resolved By</td>
                  <td>{logStatus === "RESOLVED" ? logDetails?.assignedTo || "N/A" : "----"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* First Response In Section */}
          <div className="card">
            <h4>First Response In:</h4>
            <div className="response-time">
              <h2>{formatTime(countdown.response)}</h2>
            </div>
          </div>
        </div>
      )}

      {activeTab === "related" && (
        <div className="case-details">
          <div className="card empty-card">
            <h4>Associated Similar Cases</h4>
            <p>No data available</p>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default Escalations;