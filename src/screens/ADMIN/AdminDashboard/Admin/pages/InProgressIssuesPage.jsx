import React from "react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../SidebarCSS/NotificationPage.module.css"; // Assuming you have a CSS module for styling
import AvatarIcon from "../adminIcons/avatarIcon.png";

const InProgressIssuesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inProgressData = location.state?.data || []; // Access data passed to this page
  const [openIssues, setOpenIssues] = useState(0); // State to hold the total count of logs
  // Filter issues by status
  const filterIssuesByStatus = (statuses) =>
    inProgressData.filter((issue) => statuses.includes(issue.status));

  // // Pending issues (only "PENDING")
  // const pendingIssues = filterIssuesByStatus(["PENDING"]);

  // Fetch the total open logs
  useEffect(() => {
    const fetchOpenLogs = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/ManageLogs/GetOpenLogs");
        const data = await response.json();
        
        console.log("API Response:", data); // Debugging
  
        if (response.ok) {
          if (data.isSuccess && typeof data.result === "number") {
            console.log("Setting openIssues to:", data.result); // Debugging
            setOpenIssues(data.result);
          } else {
            console.error("Unexpected API response:", data);
          }
        } else {
          console.error("Failed to fetch open logs. Status:", response.status); // Added status
          console.error("Failed to fetch open logs. Status text:", response.statusText); // Added status text
        }
      } catch (error) {
        console.error("Error fetching open logs:", error);
      }
    };
  
    fetchOpenLogs();
  });
  

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </button>



      {/* Display Pending Issues */}
      <div className={styles.noIssues}>
        <h2>Pending Issues</h2>
        <p className={styles.openIssues}>Open Issues: {openIssues}</p>
      </div>


      {/* View All Button */}
      <div className={styles.IssueButton}>
        <button
          className={styles.viewAllButton}
          onClick={() => {
            const activeIssues = filterIssuesByStatus(["PENDING", "INPROGRESS"]);
            navigate("/admindashboard/viewAllLogs", { state: { data: activeIssues } });
          }}
        >
          View All
        </button>
      </div>
    </div>
  );
};

export default InProgressIssuesPage;
