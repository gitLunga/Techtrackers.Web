import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DetailView from './DetailView';
import styles from './HOD styles/Table.module.css';
import './HOD styles/AllIssues.module.css';
import { Clock } from "lucide-react";
import FiltIcon from './HODIcons/FiltIcon.png';
import SortIcon from './HODIcons/SortIcon.png';

const Table = ({ isSidebarOpen }) => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchIssues = async () => {
    try {
      const response = await fetch("https://localhost:44328/api/AdminLog/GetLogs");
      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }
      const data = await response.json();
      console.log(data); // 🔍 Check this output
      setIssues(data);
      setFilteredIssues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchIssues();
}, []);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setFilterDropdownOpen(false);
    applyFiltersAndSorting(status, searchQuery);
  };

  const handleSortChange = (sortBy) => {
    const sortedData = [...filteredIssues].sort((a, b) => {
      if (sortBy === "user") return a.name.localeCompare(b.name);
      if (sortBy === "issueId") return a.issueId.localeCompare(b.issueId);
      if (sortBy === "time") return a.date.localeCompare(b.date);
      return 0;
    });
    setFilteredIssues(sortedData);
    setSortDropdownOpen(false);
  };

  const applyFiltersAndSorting = (status, search) => {
    const filteredData = issues.filter((issue) => {
      if (status !== "All" && issue.status !== status) return false;
      if (search && !issue.name.toLowerCase().includes(search.toLowerCase()) &&
          !issue.issueId.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
    setFilteredIssues(filteredData);
  };

  const toggleFilterDropdown = () => setFilterDropdownOpen(!filterDropdownOpen);
  const toggleSortDropdown = () => setSortDropdownOpen(!sortDropdownOpen);

  const getStatusColor = (status) => {
    switch (status) {
      case "ESCALATED":
        return "#f70000";
      case "INPROGRESS":
        return "#14788f";
      case "RESOLVED":
        return "#28a745";
      case "ONHOLD":
        return "#0a4d4d";
      case "PENDING":
        return "#ffa007";
      default:
      return "black";
    }
  };

  const handleViewClick = (issue) => setSelectedLog(issue);
  const handleBackToList = () => setSelectedLog(null);

  if (loading) return <p>Loading issues...</p>;
  if (error) return <p>Error: {error}</p>;

  if (selectedLog) {
    return <DetailView log={selectedLog} onBack={handleBackToList} />;
  }

  return (
    <div className={`HOD-main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <h2><Clock size={40} />ALL ISSUES</h2>

      <div className={styles.filterSortContainer}>
        <div className={styles.filterContainer}>
          <button className={styles.filterBtn} onClick={toggleFilterDropdown}>
            <img src={FiltIcon} width="15" height="15" alt="Filter Icon" /> Filter
          </button>
          {filterDropdownOpen && (
            <ul className={styles.filterDropdown}>
              <li onClick={() => handleFilterChange("All")}>All</li>
              <li onClick={() => handleFilterChange("Done")}>Resolved</li>
              <li onClick={() => handleFilterChange("Ongoing")}>Ongoing</li>
              <li onClick={() => handleFilterChange("On Hold")}>On Hold</li>
            </ul>
          )}
        </div>

        <div className={styles.sortContainer}>
          <button className={styles.sortBtn} onClick={toggleSortDropdown}>
            <img src={SortIcon} width="15" height="15" alt="Sort Icon" /> Sort
          </button>
          {sortDropdownOpen && (
            <ul className={styles.sortDropdown}>
              <li onClick={() => handleSortChange("user")}>Name</li>
              <li onClick={() => handleSortChange("issueId")}>Issue ID</li>
              <li onClick={() => handleSortChange("time")}>Time</li>
            </ul>
          )}
        </div>

        <input
          type="text"
          placeholder="Search by User or Issue ID"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            applyFiltersAndSorting(filterStatus, e.target.value);
          }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.issueTable} aria-label="Issues Table">
          <thead>
            <tr>
              <th>Issue ID</th>
              <th>Title</th>
              <th>Assigned to</th>
              <th>Date Reported</th>
              <th>Priority Level</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
      <tbody>
  {filteredIssues.length > 0 ? (
    filteredIssues.map((issue) => (
      <tr key={issue.issueId}>
        <td>{issue.issueId}</td>
        <td>{issue.issueTitle}</td>
        <td>{issue.assignedTo}</td>
        <td>{issue.issuedAt ? new Date(issue.issuedAt).toLocaleDateString() : "N/A"}</td>
        <td>{issue.priority}</td>
        <td>
       <span
  className={styles.status}
  style={{ color: getStatusColor(issue.status) }}
>
  {issue.status}
</span>
        </td>
        <td>
          <button className={styles.viewButton} onClick={() => handleViewClick(issue)}>View</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7">No issues available</td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

Table.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};


export default Table;