"use client"

import { useEffect, useState } from "react"
import { Clock, Search, Filter, SortAsc } from "lucide-react"
import styles from "./StaffStyle/MainContent.module.css"

export default function MainContent({ onSelectIssue, onOpenChat }) {
  const [issues, setIssues] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [sortOption, setSortOption] = useState("Date Descending")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true)
        const userInfo = JSON.parse(localStorage.getItem("user_info"))
        const userId = userInfo ? userInfo.userId : null

        if (!userId) {
          throw new Error("User ID not found. Please log in again.")
        }

        const response = await fetch(`https://localhost:44328/api/Log/GetLogsForStaff?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched logs:", data)

          localStorage.setItem("staff logs", JSON.stringify(data))

          // Sort the issues by date in descending order (latest first)
          const sortedData = data.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))

          setIssues(sortedData)
          setError(null)
        } else {
          throw new Error("Failed to fetch issues")
        }
      } catch (error) {
        console.error("Error fetching issues:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIssues()
  }, [])

  // Handlers for search, filter, and sort changes
  const handleSearchChange = (e) => setSearchTerm(e.target.value.toLowerCase())
  const handleFilterChange = (e) => setFilterStatus(e.target.value)
  const handleSortChange = (e) => setSortOption(e.target.value)

  // Apply search, filter, and sort to the list of issues
  const filteredAndSortedIssues = issues
    .filter((issue) => issue.issueTitle.toLowerCase().includes(searchTerm))
    .filter(
      (issue) => filterStatus === "All" || (issue.status && issue.status.toLowerCase() === filterStatus.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOption === "Date Descending") {
        return new Date(b.issuedAt) - new Date(a.issuedAt)
      } else if (sortOption === "Date Ascending") {
        return new Date(a.issuedAt) - new Date(b.issuedAt)
      } else if (sortOption === "Priority High to Low") {
        return b.priority.localeCompare(a.priority)
      } else if (sortOption === "Priority Low to High") {
        return a.priority.localeCompare(b.priority)
      }
      return 0
    })

  const formatStatus = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Unknown"
  }

  if (isLoading) {
    return (
      <main className={styles.MmainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading issues...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className={styles.MmainContent}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.MmainContent}>
      <div className={styles.statusHeader}>
        <Clock size={32} className={styles.headerIcon} />
        <h2>ALL ISSUES</h2>
        <span className={styles.issueCount}>({filteredAndSortedIssues.length} issues)</span>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by Issue Title"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <Filter size={16} className={styles.filterIcon} />
          <select onChange={handleFilterChange} className={styles.filterSelect} value={filterStatus}>
            <option value="All">All Status</option>
            <option value="INPROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className={styles.sortContainer}>
          <SortAsc size={16} className={styles.sortIcon} />
          <select onChange={handleSortChange} className={styles.sortSelect} value={sortOption}>
            <option value="Date Descending">Date (Newest)</option>
            <option value="Date Ascending">Date (Oldest)</option>
            <option value="Priority High to Low">Priority (High to Low)</option>
            <option value="Priority Low to High">Priority (Low to High)</option>
          </select>
        </div>
      </div>

      {filteredAndSortedIssues.length === 0 ? (
        <div className={styles.noResults}>
          <p>No issues found matching your criteria.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.issuesTable}>
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Issue Title</th>
                <th>Date Reported</th>
                <th>Department</th>
                <th>Priority Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedIssues.map((issue) => (
                <tr key={issue.issueId} className={styles.tableRow}>
                  <td data-label="Issue ID">{issue.issueId}</td>
                  <td data-label="Issue Title" className={styles.titleCell}>
                    {issue.issueTitle}
                  </td>
                  <td data-label="Date Reported" className={styles.dateCell}>
                    <div className={styles.dateContainer}>
                      <span className={styles.date}>{new Date(issue.issuedAt).toLocaleDateString()}</span>
                      <span className={styles.time}>
                        {new Date(issue.issuedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </td>
                  <td data-label="Department">{issue.department}</td>
                  <td data-label="Priority Level">
                    <span className={`${styles.priority} ${styles[`priority${issue.priority?.toLowerCase()}`]}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`${styles.status} ${styles[issue.status ? issue.status.toLowerCase() : "unknown"]}`}
                    >
                      {formatStatus(issue.status)}
                    </span>
                  </td>
                  <td data-label="Action">
                    <button
                      className={styles.viewButton}
                      onClick={() => {
                        onSelectIssue(issue)
                        localStorage.setItem("selected_log_id", issue.logId)
                      }}
                      aria-label={`View details for issue ${issue.issueId}`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
