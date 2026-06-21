import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../SidebarCSS/NotificationPage.module.css"; // Use the same CSS module

const IssueSummaryPage = () => {
  const navigate = useNavigate();
  const [totalIssues, setTotalIssues] = useState(0); // State to hold the total count of logs

  // Fetch the total count of logs
  useEffect(() => {
    const fetchTotalLogs = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/ManageLogs/CountAllLogs");
        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data); // Debugging
          if (data.isSuccess && typeof data.result === "number") {
            setTotalIssues(data.result); // Extract and set the count from `result`
          } else {
            console.error("Unexpected API response structure:", data);
          }
        } else {
          console.error("Failed to fetch total logs.");
        }
      } catch (error) {
        console.error("Error fetching total logs:", error);
      }
    };

    fetchTotalLogs();
  }, []);

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button
        className={styles.backButton}
        onClick={() => navigate(-1)} // Go back to the previous page
      >
        ← {/* Left arrow */}
      </button>
      <div className={styles.header}>
        <h1>Issue Summary</h1>
        <p className={styles.totalIssues}>Total Issues: {totalIssues}</p>
      </div>

      {/* No issues displayed, only the total */}
      <div className={styles.IssueButton}>
        {/* View All Button */}
        <button
          className={styles.viewAllButton}
          onClick={() => navigate("/admindashboard/viewAllLogs")} // Navigate to the full issue list
        >
          View All
        </button>
      </div>
    </div>
  );
};

export default IssueSummaryPage;
