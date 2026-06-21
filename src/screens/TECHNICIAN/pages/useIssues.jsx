import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useIssues = () => {
  const [issues, setIssues] = useState([]); // State to hold issues
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Get user info from local storage
        const userInfo = JSON.parse(localStorage.getItem("user_info"));
        if (!userInfo || !userInfo.userId) {
          throw new Error("User not logged in or user ID missing.");
        }

        const userId = userInfo.userId;

        // Fetch issue details from the API
        const response = await fetch(
          `https://localhost:44328/api/Log/GetLogsTechnician?userId=${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.length === 0) {
          toast.warn("No issues found for the technician.");
          setIssues([]); // Set issues to empty array
        } else {
          // Deduplicate issues by `issueId` and merge with predefined issues
          const uniqueIssues = data.filter(
            (issue, index, self) =>
              index === self.findIndex((i) => i.issueId === issue.issueId)
          );

          setIssues((prevIssues) => [
            ...prevIssues.filter(
              (prevIssue) =>
                !uniqueIssues.some((issue) => issue.issueId === prevIssue.issueId)
            ),
            ...uniqueIssues,
          ]);
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return { issues, setIssues, loading, error };
};

export default useIssues;
