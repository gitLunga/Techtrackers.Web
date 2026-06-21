import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, List, ArrowLeft, Clock } from "lucide-react";
import DetailView from "./DetailView";
import styles from "../SidebarCSS/ViewAllLog.module.css";

function ViewAllLogs() {
  const [logs, setLogs] = useState([]); // Original logs from API
  const [filteredLogs, setFilteredLogs] = useState([]); // Filtered and searchable logs
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("issuedAt-desc");

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  

  const formatStatus = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };
  // Fetch logs from the API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/AdminLog/GetLogs");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched logs:", data); // Debug: Log fetched data

          localStorage.setItem("Admin Logs", JSON.stringify(data));

          // Sort logs by `issuedAt` date in descending order
          const sortedLogs = data.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  
          setLogs(sortedLogs); // Store sorted logs
          setFilteredLogs(sortedLogs); // Initialize `filteredLogs` with sorted data
        } else {
          console.error("Failed to fetch logs.");
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
  
    fetchLogs();
  }, []);
  

  // Load sort option from localStorage on component mount
  useEffect(() => {
    const savedSort = localStorage.getItem("selectedSort");
    if (savedSort) {
      const [key, direction] = savedSort.split("-");
      handleSort(key, direction);
    }
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
  
    // Filter logs based on the search term and update `filteredLogs`
    const filtered = logs.filter((log) =>
      Object.values(log)
        .join(" ")
        .toLowerCase()
        .includes(term.toLowerCase())
    );
    setFilteredLogs(filtered);
  };
  
  const handleFilter = (status) => {
    setFilterStatus(status);

    if (status === "all") {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(
        (log) => log.status.toLowerCase() === status.toLowerCase()
      );
      setFilteredLogs(filtered);
    }
    setIsFilterModalOpen(false);
  };

  const handleSort = (key, direction) => {
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredLogs(sortedLogs);

    // Persist sort option in state and localStorage
    const sortOption = `${key}-${direction}`;
    setSelectedSort(sortOption);
    localStorage.setItem("selectedSort", sortOption);

    setIsSortModalOpen(false);
  };

    // Close modals on outside click
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (filterRef.current && !filterRef.current.contains(event.target)) {
          setIsFilterModalOpen(false);
        }
        if (sortRef.current && !sortRef.current.contains(event.target)) {
          setIsSortModalOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  const handleViewLog = (log) => {
    console.log("Selected log ID:", log.logId);
    setSelectedLog(log);
  };

  const handleBackToList = () => {
    setSelectedLog(null);
  };

  if (selectedLog) {
    return <DetailView log={selectedLog} onBack={handleBackToList} />;
  }

  return (
    <main className={styles.dashboardContainer}>
      <div className={styles.logsHeader}>
        <h2 className={styles.logsTitle}>
          <Clock size={40} />
          All Logs
        </h2>
      </div>
      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search"
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className={styles.filterSort}>
      <div className={styles.filterButtonContainer} ref={filterRef}>
          <button
            className={styles.filterButton}
            onClick={() => setIsFilterModalOpen((prev) => !prev)}
          >
            <Filter />
            Filter
          </button>
          {isFilterModalOpen && (
            <div className={styles.modal}>
              <h3>Filter Logs</h3>
              <div className={styles.filterOptions}>
                <input
                  type="radio"
                  id="all"
                  name="status"
                  value="all"
                  checked={filterStatus === "all"}
                  onChange={() => handleFilter("all")}
                />
                <label htmlFor="all">All</label>

                <input
                  type="radio"
                  id="escalated"
                  name="status"
                  value="escalated"
                  checked={filterStatus === "escalated"}
                  onChange={() => handleFilter("escalated")}
                />
                <label htmlFor="escalated">Escalated</label>

                <input
                  type="radio"
                  id="pending"
                  name="status"
                  value="pending"
                  checked={filterStatus === "pending"}
                  onChange={() => handleFilter("pending")}
                />
                <label htmlFor="pending">Pending</label>

                <input
                  type="radio"
                  id="inprogress"
                  name="status"
                  value="inprogress"
                  checked={filterStatus === "inprogress"}
                  onChange={() => handleFilter("inprogress")}
                />
                <label htmlFor="inprogress">In Progress</label>

                <input
                  type="radio"
                  id="on hold"
                  name="status"
                  value="on hold"
                  checked={filterStatus === "on hold"}
                  onChange={() => handleFilter("on hold")}
                />
                <label htmlFor="on hold">Oh Hold</label>

                <input
                  type="radio"
                  id="resolved"
                  name="status"
                  value="resolved"
                  checked={filterStatus === "resolved"}
                  onChange={() => handleFilter("resolved")}
                />
                <label htmlFor="resolved">Resolved</label>

                <input 
                type="radio"
                id="closed"
                name="status"
                value="closed"
                checked={filterStatus === "closed"}
                onChange={() => handleFilter("closed")}
                />
                <label htmlFor="closed">Closed</label>
              </div>
            </div>
          )}
        </div>
        <div className={styles.sortButtonContainer} ref={sortRef}>
          <button
            className={styles.sortButton}
            onClick={() => setIsSortModalOpen((prev) => !prev)}
          >
            <List />
            Sort
          </button>
          {isSortModalOpen && (
            <div className={styles.sortModal}>
              <h3>Sort Logs</h3>
              <div className={styles.sortOptions}>
                <button
                  onClick={() => handleSort("issuedAt", "asc")}
                  className={
                    selectedSort === "issuedAt-asc" ? styles.activeSort : ""
                  }
                >
                  Date Reported (Oldest)
                </button>
                <button
                  onClick={() => handleSort("issuedAt", "desc")}
                  className={
                    selectedSort === "issuedAt-desc" ? styles.activeSort : ""
                  }
                >
                  Date Reported (Newest)
                </button>
                
              </div>
            </div>
          )}
        </div>
      </div>
      <table className={styles.logsTable}>
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Issue Title</th>
            <th>Date Reported</th>
            <th>Priority Level</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          
          {filteredLogs.map((log) => (
            <tr key={log.logId}>
              <td>{log.issueId}</td>
              <td>{log.issueTitle}</td>
              <td>{new Date(log.issuedAt).toLocaleDateString()}</td>
              <td>{log.priority}</td>
              <td>{log.assignedTo}</td>
              <td>
              <span
                className={`${styles.status} ${styles[`status${formatStatus(log.status)}`]}`}
              >
                {formatStatus(log.status)} {/* Display formatted status */}
             </span>
            </td>
              <td>
                <button
                  className={styles.viewButton}
                  onClick={() => handleViewLog(log)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default ViewAllLogs;
