import React, { useState, useEffect, useRef } from "react";
import IssueRow from "./IssueRow";
import styles from "./ManageLogs.module.css";
import DetailView from "./DetailView";

const ManageLogs = ({ isSidebarOpen }) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("issuedAt-desc");
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Fetch logs on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/AdminLog/GetLogs");
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("Admin Logs", JSON.stringify(data));

          // Default sort by issuedAt desc
          const sortedLogs = [...data].sort(
            (a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)
          );

          setLogs(sortedLogs);
          setFilteredLogs(sortedLogs);
          setLoading(false);
        } else {
          setError(`Failed to fetch logs. Status: ${response.status}`);
          setLoading(false);
        }
      } catch (err) {
        setError("Error fetching logs: " + err.message);
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Apply filters and sorting when inputs change
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const [sortKey, sortDirection] = selectedSort.split("-");

    let result = [...logs];

    if (searchQuery) {
      result = result.filter(
        (log) =>
          (log.issueTitle?.toLowerCase().includes(query) || false) ||
          (log.priority?.toLowerCase().includes(query) || false) ||
          (log.assignedTo?.toLowerCase().includes(query) || false) ||
          (log.issueId?.toString().includes(query) || false)
      );
    }

    if (filterPriority) {
      result = result.filter((log) => log.priority === filterPriority);
    }

    if (filterStatus !== "all") {
      result = result.filter(
        (log) => log.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue == null) return 1; // Push null/undefined to end
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Assume date or number
      return sortDirection === "asc"
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    });

    setFilteredLogs(result);
  }, [logs, searchQuery, filterPriority, filterStatus, selectedSort]);

  // Load saved sort preference from localStorage
  useEffect(() => {
    const savedSort = localStorage.getItem("selectedSort");
    if (savedSort) {
      setSelectedSort(savedSort);
    }
  }, []);

  // Handle closing modals on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        // setIsFilterModalOpen(false); // You can implement filter modal if needed
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        // setIsSortModalOpen(false); // You can implement sort modal if needed
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (key, direction) => {
    const sortOption = `${key}-${direction}`;
    setSelectedSort(sortOption);
    localStorage.setItem("selectedSort", sortOption);
    // setIsSortModalOpen(false); // If using modal
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
    // setIsFilterModalOpen(false); // If using modal
  };

  if (selectedLog) {
    return (
      <DetailView
        log={selectedLog}
        onBack={() => setSelectedLog(null)}
        isSidebarOpen={isSidebarOpen}
      />
    );
  }

  return (
    <div
      className={`${styles["manage-logs-container"]} ${
        isSidebarOpen ? styles["sidebar-open"] : styles["sidebar-closed"]
      }`}
    >
      <h1>Manage Logs</h1>

      {loading ? (
        <p>Loading logs...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          {/* Search, Sort & Filter Controls */}
          <div className={styles.controlsContainer}>
            <input
              type="text"
              placeholder="Search issues..."
              className={styles.searchBar}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className={styles.buttonsContainer}>
              <button
                className={styles.sortButton}
                onClick={() =>
                  handleSort(
                    "priority",
                    selectedSort.endsWith("asc") ? "desc" : "asc"
                  )
                }
              >
                Sort by Priority {selectedSort.endsWith("asc") ? "▲" : "▼"}
              </button>

              <select
                className={styles.filterDropdown}
                onChange={(e) => setFilterPriority(e.target.value)}
                value={filterPriority}
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <table className={styles["logs-table"]}>
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Issue Title</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Logged Date</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <IssueRow
                  key={log.id}
                  log={log}
                  onSelect={() => setSelectedLog(log)}
                />
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ManageLogs;
