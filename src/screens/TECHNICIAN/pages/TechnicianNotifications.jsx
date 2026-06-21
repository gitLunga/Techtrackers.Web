"use client"

import { useState, useEffect } from "react"
import bell from "../images/bell.png"
import filter from "../images/filter_icon.png"
import list from "../images/list_icon.png"
import profile from "../images/profile_icon.png"
import search from "../images/search.png"
import styles from "../SidebarCSS/NotificationsStyle.module.css"
import { useNavigate } from "react-router-dom"

const NotificationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("")
  const [sortOrder, setSortOrder] = useState("")
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [animateNotifications, setAnimateNotifications] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const userInfo = JSON.parse(localStorage.getItem("user_info"))
        const userId = userInfo ? userInfo.userId : null

        if (!userId) {
          throw new Error("User ID not found in localStorage.")
        }

        const response = await fetch(`https://localhost:44328/api/Log/GetNotifications/${userId}?onlyUnread=false`)
        if (!response.ok) {
          throw new Error("Failed to fetch notifications from the API.")
        }

        const data = await response.json()
        setNotifications(data)

        // Trigger animations after data loads
        setTimeout(() => setAnimateNotifications(true), 300)

        console.log("Fetched notifications:", data)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return new Date(0)
    }
    return new Date(timestamp)
  }

  const getStatusColor = (status) => {
    const statusColors = {
      resolved: "#28a745",
      unresolved: "#dc3545",
      pending: "#ffc107",
      "in-progress": "#17a2b8",
    }
    return statusColors[status] || "#6c757d"
  }

  const getNotificationIcon = (type) => {
    const icons = {
      assignment: "📋",
      resolution: "✅",
      collaboration: "🤝",
      ALERT: "🚨",
      INFORMATION: "ℹ️",
      WARNING: "⚠️",
    }
    return icons[type] || "📢"
  }

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      HIGH: styles.highPriority,
      MEDIUM: styles.mediumPriority,
      LOW: styles.lowPriority,
    }
    return priorityClasses[priority] || ""
  }

  // Combine filter, search, and sort logic in one place
  const filteredNotifications = notifications
    .filter((notification) => {
      const fullContent = [
        notification.issueId,
        notification.issueTitle,
        notification.type,
        notification.notificationType,
        notification.location,
        notification.priority,
        notification.sender,
        notification.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return fullContent.includes(searchQuery.toLowerCase()) && (filterType ? notification.type === filterType : true)
    })
    .sort((a, b) => {
      const dateA = formatDate(a.timestamp)
      const dateB = formatDate(b.timestamp)

      if (sortOrder === "newest") {
        return dateB - dateA
      } else if (sortOrder === "oldest") {
        return dateA - dateB
      }
      return 0
    })

  const handleIssueClick = (notificationId) => {
    console.log("Selected notification ID:", notificationId)
    navigate(`/techniciandashboard/notifications/${notificationId}`)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterSelect = (type) => {
    setFilterType(type)
  }

  const handleSortSelect = (order) => {
    setSortOrder(order)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterType("")
    setSortOrder("")
  }

  if (isLoading) {
    return (
      <div className={styles.notificationsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.notificationsContainer} ${isLoading ? styles.loading : ""}`}>
      <div className={styles.notificationsHeader}>
        <h2 className={styles.notificationsTitle}>
          <img src={bell || "/placeholder.svg"} alt="Bell" height={30} className={styles.notificationsTitleSvg} />
          NOTIFICATIONS
          {filteredNotifications.length > 0 && (
            <span className={styles.notificationCount}>({filteredNotifications.length})</span>
          )}
        </h2>

        <div className={styles.filterContainer}>
          <div className={styles.theSearchContainer}>
            <input
              type="text"
              placeholder="Search notifications..."
              className={styles.theSearchInput}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <img src={search || "/placeholder.svg"} className={styles.theSearchIcon} alt="Search" />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.notificationDropdown}>
              <button className={styles.theSearchFilterButton}>
                <img src={filter || "/placeholder.svg"} alt="Filter" height={15} />
                Filter
                {filterType && <span className={styles.activeFilterBadge}>•</span>}
              </button>
              <div className={styles.notificationDropdownContent}>
                <div className={styles.notificationDropdownItem} onClick={() => handleFilterSelect("")}>
                  🔄 All Types
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleFilterSelect("assignment")}>
                  📋 Assignment
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleFilterSelect("resolution")}>
                  ✅ Resolution
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleFilterSelect("collaboration")}>
                  🤝 Collaboration
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleFilterSelect("ALERT")}>
                  🚨 Alert
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleFilterSelect("INFORMATION")}>
                  ℹ️ Information
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleFilterSelect("WARNING")}>
                  ⚠️ Warning
                </div>
              </div>
            </div>

            <div className={styles.notificationDropdown}>
              <button className={styles.theSortButton}>
                <img src={list || "/placeholder.svg"} alt="Sort" height={15} />
                Sort
                {sortOrder && <span className={styles.activeSortBadge}>•</span>}
              </button>
              <div className={styles.notificationDropdownContent}>
                <div className={styles.notificationDropdownItem} onClick={() => handleSortSelect("newest")}>
                  🕐 Newest First
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleSortSelect("oldest")}>
                  🕑 Oldest First
                </div>
                <div className={styles.notificationDropdownItem} onClick={() => handleSortSelect("")}>
                  📊 Default Order
                </div>
              </div>
            </div>

            {(searchQuery || filterType || sortOrder) && (
              <button className={styles.clearFiltersButton} onClick={clearFilters}>
                ✖️ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.notificationsList}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => (
            <div
              key={notification.id || index}
              className={`${styles.notificationItem} ${animateNotifications ? styles.animate : ""} ${getPriorityClass(notification.priority)}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.notificationProfile}>
                <img src={profile || "/placeholder.svg"} alt="Profile" height={50} />
                <div className={styles.notificationTypeIcon}>{getNotificationIcon(notification.type)}</div>
              </div>

              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <p className={styles.notificationSender}>
                    <strong>{notification.sender || "System"}</strong>
                    {notification.type && <span className={styles.notificationTypeBadge}>{notification.type}</span>}
                  </p>

                  {notification.priority && (
                    <span className={`${styles.priorityBadge} ${styles[notification.priority.toLowerCase()]}`}>
                      {notification.priority}
                    </span>
                  )}
                </div>

                <div className={styles.notificationMessage}>
                  {notification.message}
                  {notification.status && (
                    <span className={styles.statusIndicator} style={{ color: getStatusColor(notification.status) }}>
                      • {notification.status.toUpperCase()}
                    </span>
                  )}
                </div>

                {notification.staffName && (
                  <p className={styles.notificationStaffName}>
                    👤 Assigned to: <strong>{notification.staffName}</strong>
                  </p>
                )}

                {notification.issueTitle && (
                  <p className={styles.notificationIssue}>
                    📋 Issue: <strong>{notification.issueTitle}</strong>
                  </p>
                )}

                {notification.location && (
                  <p className={styles.notificationLocation}>📍 Location: {notification.location}</p>
                )}

                {notification.action && (
                  <p className={styles.notificationAction} onClick={() => navigate(`/reviews`)}>
                    {notification.action} →
                  </p>
                )}
              </div>

              <div className={styles.notificationMeta}>
                <span className={styles.notificationTime}>
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(formatDate(notification.timestamp))}
                </span>

                <button
                  className={styles.notificationViewButton}
                  onClick={() => handleIssueClick(notification.notificationId)}
                >
                   View Details
                </button>

                <span className={styles.notificationTime2}>
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  }).format(formatDate(notification.timestamp))}
                  <br />
                  {new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(formatDate(notification.timestamp))}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noNotifications}>
            <div className={styles.noNotificationsIcon}>🔔</div>
            <h3>No notifications found</h3>
            <p>
              {searchQuery || filterType
                ? "Try adjusting your search or filter criteria."
                : "You're all caught up! No new notifications at this time."}
            </p>
            {(searchQuery || filterType || sortOrder) && (
              <button className={styles.resetButton} onClick={clearFilters}>
                🔄 Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
