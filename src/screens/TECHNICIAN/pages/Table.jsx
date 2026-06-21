
import {React, useEffect, useMemo, useState } from "react"
import Header from "./TableHeader"
import { sortAndFilterData } from "./Sort"
import { useNavigate } from "react-router-dom"
import styles from "../SidebarCSS/TableAllIssues.module.css"

const Table = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [isTableVisible, setIsTableVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [animateRows, setAnimateRows] = useState(false)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  })
  const [filters, setFilters] = useState({
    date: "",
    status: "",
    department: "",
    priority: "",
  })

  // Fetch issues on component mount
  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true)
      try {
        const userInfo = JSON.parse(localStorage.getItem("user_info"))
        if (!userInfo || !userInfo.userId) {
          alert("User is not logged in or userId is missing.")
          return
        }

        const userId = userInfo.userId
        const response = await fetch(`https://localhost:44328/api/Log/GetLogsTechnician?userId=${userId}`)

        if (response.ok) {
          const data = await response.json()
          console.log("Fetched Issues:", data)

          localStorage.setItem("Tech Issues", JSON.stringify(data))
          setIssues(data)

          // Trigger row animations after data loads
          setTimeout(() => setAnimateRows(true), 300)
        } else {
          alert("Failed to fetch issues. Please try again later.")
        }
      } catch (error) {
        console.error("Error fetching issues:", error)
        alert("An error occurred while fetching issues.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchIssues()
  }, [])

  // Sort handler
  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const handleSortOption = (sortOption) => {
    const options = {
      "date-old-new": { key: "issuedAt", direction: "ascending" },
      "date-new-old": { key: "issuedAt", direction: "descending" },
    }

    if (options[sortOption]) {
      setSortConfig(options[sortOption])
    }
  }

  // Filter handler
  const handleFilter = (filter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter.key]: filter.value,
    }))
  }

  // Search handler
  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  // Show all issues handler
  const handleShowAllIssues = () => {
    setSearchTerm("")
    setFilters({
      date: "",
      status: "",
      department: "",
      priority: "",
    })
    setSortConfig({
      key: null,
      direction: null,
    })
  }

  // Memoized filtered and sorted issues
  const filteredAndSortedIssues = useMemo(() => {
    const filteredIssues = issues.filter((issue) => {
      const issueId = issue.issueId ? issue.issueId.toString() : ""
      const issueTitle = issue.issueTitle || ""
      const department = issue.department || ""
      const priority = issue.priority || ""
      const status = issue.status || ""

      const matchesSearchTerm =
        issueId.includes(searchTerm) ||
        issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        status.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilters =
        (!filters.department || department === filters.department) &&
        (!filters.priority || priority === filters.priority) &&
        (!filters.status || status === filters.status)

      return matchesSearchTerm && matchesFilters
    })

    return sortAndFilterData(filteredIssues, sortConfig, filters)
  }, [issues, sortConfig, filters, searchTerm])

  // Status color handler with enhanced colors
  const getStatusColor = (status) => {
    const statusColors = {
      ESCALATED: "#f70000",
      INPROGRESS: "#14788f",
      RESOLVED: "#28a745",
      ONHOLD: "#0a4d4d",
      PENDING: "#ffa007",
    }
    return statusColors[status] || "#6c757d"
  }

  // Priority color handler
  const getPriorityColor = (priority) => {
    const priorityColors = {
      HIGH: "#dc3545",
      MEDIUM: "#fd7e14",
      LOW: "#28a745",
    }
    return priorityColors[priority] || "#6c757d"
  }

  const handleViewClick = (issueId) => {
    localStorage.setItem("selected_issue_id", issueId)
    navigate(`/techniciandashboard/issues/${issueId}`)
  }

  // Function to close the table
  const handleClose = () => {
    navigate("/techniciandashboard/dashboard")
  }

  // Format date for better display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your issues...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isTableVisible && (
        <div className={`${styles.tableContainer} ${isLoading ? styles.loading : ""}`}>
          <Header handleSort={handleSortOption} handleFilter={handleFilter} handleSearch={handleSearch} />

          <div className={styles.controls}>
            <button className={styles.showAllButton} onClick={handleShowAllIssues}>
              🔄 Show All Issues
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.issueTable}>
              <thead>
                <tr>
                  <th onClick={() => handleSort("issueId")}>
                    Issue ID
                    <span className={styles.sortIndicator}>⇅</span>
                  </th>
                  <th onClick={() => handleSort("issueTitle")}>
                    Issue Title
                    <span className={styles.sortIndicator}>⇅</span>
                  </th>
                  <th onClick={() => handleSortOption("date-new-old")} style={{ cursor: "pointer" }}>
                    Date Reported
                    <span className={styles.sortIndicator}>⇅</span>
                  </th>
                  <th onClick={() => handleSort("department")}>
                    Department
                    <span className={styles.sortIndicator}>⇅</span>
                  </th>
                  <th onClick={() => handleSort("priority")}>
                    Priority Level
                    <span className={styles.sortIndicator}>⇅</span>
                  </th>
                  <th onClick={() => handleSort("status")}>
                    Status
                    <span className={styles.sortIndicator}>⇅</span>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedIssues.length > 0 ? (
                  filteredAndSortedIssues.map((issue, index) => (
                    <tr
                      key={issue.issueId}
                      className={`${styles.tableRow} ${animateRows ? styles.animate : ""}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>
                        <span className={styles.issueIdBadge}>#{issue.issueId}</span>
                      </td>
                      <td>
                        <div className={styles.issueTitleContainer}>
                          <span className={styles.issueTitle}>{issue.issueTitle}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>{formatDate(issue.issuedAt)}</span>
                      </td>
                      <td>
                        <span className={styles.departmentBadge}>{issue.department}</span>
                      </td>
                      <td>
                        <span
                          className={styles.priorityBadge}
                          style={{
                            backgroundColor: getPriorityColor(issue.priority),
                            color: "white",
                          }}
                        >
                          {issue.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            color: getStatusColor(issue.status),
                            borderColor: getStatusColor(issue.status),
                          }}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td>
                        <button className={styles.viewButton} onClick={() => handleViewClick(issue.issueId)}>
                          {/* <span className={styles.buttonIcon}>👁️</span> */}
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={styles.noDataMessage}>
                      <div className={styles.noDataContainer}>
                        <span className={styles.noDataIcon}>📋</span>
                        <p>No issues found matching your criteria</p>
                        <button className={styles.resetFiltersButton} onClick={handleShowAllIssues}>
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.endMessage}>
            <div className={styles.line} />
            <span className={styles.tableSpan}>
              📊 You have reached the end ({filteredAndSortedIssues.length} issues)
            </span>
            <div className={styles.line} />
          </div>

          <div className={styles.tableFooter}>
            <button className={styles.closeButton} onClick={handleClose}>
              ✖️ CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Table
