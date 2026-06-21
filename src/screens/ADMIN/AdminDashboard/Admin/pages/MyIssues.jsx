import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../SidebarCSS/Table.module.css';
import PropTypes from 'prop-types';
import DetailView from './DetailView'; // Ensure this import is correct for DetailView


const Table = ({ adminId }) => {
  const [issues, setIssues] = useState([]); // State to store fetched issues
  const [selectedLog, setSelectedLog] = useState(null); // State to store selected log
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [filterStatus, setFilterStatus] = useState(''); // State for filter
  const [sortOrder, setSortOrder] = useState('newest'); // State for sort order

  const navigate = useNavigate();

  // Fetch issues from the API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user_info'));
        const userId = userInfo ? userInfo.userId : null;
        const response = await fetch(
          `https://localhost:44328/api/AdminLog/GetAdminLoggedIssues/GetAdminLoggedIssues/admin/${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIssues(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIssues();
  }, [adminId]);

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
      case "CLOSED":
        return "#f70000";
      default:
        return "black";
    }
  };

  // Apply search, filter, and sort
  const filteredAndSortedIssues = issues
    .filter((issue) => {
      // Filter issues by search query
      return (
        issue.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .filter((issue) => {
      // Filter by selected status
      return filterStatus ? issue.status.toLowerCase() === filterStatus.toLowerCase() : true;
    })
    .sort((a, b) => {
      // Sort issues by date
      const dateA = new Date(a.issuedAt);
      const dateB = new Date(b.issuedAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleSearch = (event) => {
    setSearchQuery(event.target.value); // Update search query
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value); // Update filter status
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value); // Update sort order
  };

  const handleViewClick = (issue) => {
    setSelectedLog(issue); // Set the selected log to the clicked issue
  };

  const handleBackToList = () => {
    setSelectedLog(null); // Reset selected log to go back to the list view
  };

  if (loading) {
    return <div>Loading...</div>; // Loading message
  }

  if (error) {
    return <div>Error: {error}</div>; // Error message
  }

  if (selectedLog) {
    return <DetailView log={selectedLog} onBack={handleBackToList} />; // Render DetailView if a log is selected
  }

  return (
    <div className={styles.tableContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <i className="fa-regular fa-clock" aria-hidden="true"></i>
          <div className={styles.headerText}>
            <h2>My Issues</h2>
          </div>
        </div>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchBar}
            value={searchQuery}
            onChange={handleSearch}
          />
          <select
            className={styles.filterDropdown}
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="">Filter by Status</option>
            <option value="PENDING">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="INPROGRESS">In Progress</option>
            <option value="ONHOLD">On Hold</option>
            <option value="ESCALATED">Escalated</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            className={styles.sortDropdown}
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
          </select>
          <button
            className={styles.logIssueButton}
            onClick={() => navigate('/admindashboard/LogIssue')}
          >
            LOG ISSUE
          </button>
        </div>
      </header>
      <table className={styles.issueTable}>
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Name</th>
            <th>Issue Title</th>
            <th>Assigned to</th>
            <th>Date Reported</th>
            <th>Department</th>
            <th>Priority Level</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedIssues.map((issue) => (
            <tr key={issue.issueId}>
              <td>{issue.issueId}</td>
              <td>{issue.logBy}</td>
              <td>{issue.issueTitle}</td>
              <td>{issue.assignedTo}</td>
              <td>{new Date(issue.issuedAt).toLocaleDateString()}</td>
              <td>{issue.department}</td>
              <td>{issue.priority}</td>
              <td>
                <div
                  className={styles.status}
                  style={{
                    color: getStatusColor(issue.status),
                    display: 'inline',
                  }}
                >
                  {issue.status}
                </div>
              </td>
              <td>
                <button
                  className={styles.viewButton}
                  onClick={() => handleViewClick(issue)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  adminId: PropTypes.number.isRequired, // Admin ID to fetch issues for
};

export default Table;
