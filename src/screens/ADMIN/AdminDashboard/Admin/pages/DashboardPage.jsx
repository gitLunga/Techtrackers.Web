

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsers, faClock, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import styles from "../SidebarCSS/DashboardPage.module.css"
import totalIssuesIcon from "../adminIcons/totalIssuesIcon.png"
import openIssuesIcon from "../adminIcons/openIssuesIcon.png"

const DashboardPage = () => {
  const navigate = useNavigate()
  const [issueCounts, setIssueCounts] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    onHold: 0,
    escalated: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [animateCards, setAnimateCards] = useState(false)

  const stats = {
    resolvedThisWeek: 19,
    avgResolutionTime: "2.5 days",
    techniciansCount: 0,
  }

  const handleTotalIssuesClick = () => {
    navigate("/admindashboard/issue-summary")
  }

  const handleOpenIssuesClick = () => {
    navigate("/admindashboard/in-progress-issues")
  }

  const handleManageTechClick = () => {
    navigate("/admindashboard/ManageTech")
  }

  const fetchCountByStatus = async (status) => {
    try {
      const response = await fetch(`https://localhost:44328/api/ManageLogs/CountLogsByStatus/${status}`)
      if (!response.ok) throw new Error(`Failed to fetch ${status} issues`)
      const data = await response.json()
      return data.isSuccess ? data.result : 0
    } catch (error) {
      console.error(`Error fetching ${status} issues:`, error)
      return 0
    }
  }

  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        setLoading(true)

        // Fetch total issues count
        const totalResponse = await fetch("https://localhost:44328/api/ManageLogs/CountAllLogs")
        if (!totalResponse.ok) throw new Error("Failed to fetch total issues")
        const totalData = await totalResponse.json()

        // Fetch counts for each status in parallel
        const [pendingCount, inProgressCount, resolvedCount, onHoldCount, escalatedCount] = await Promise.all([
          fetchCountByStatus("Pending"),
          fetchCountByStatus("InProgress"),
          fetchCountByStatus("Resolved"),
          fetchCountByStatus("OnHold"),
          fetchCountByStatus("Escalated"),
        ])

        setIssueCounts({
          total: totalData.isSuccess ? totalData.result : 0,
          pending: pendingCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          onHold: onHoldCount,
          escalated: escalatedCount,
        })
      } catch (error) {
        console.error("Error fetching issue counts:", error)
        setError(error.message)
      } finally {
        setLoading(false)
        // Trigger card animations after data loads
        setTimeout(() => setAnimateCards(true), 100)
      }
    }

    fetchAllCounts()
  }, [])

  const openIssues = issueCounts.pending + issueCounts.onHold + issueCounts.inProgress

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Loading dashboard data...</div>
          <div className={styles.skeletonContainer}>
            {[...Array(5)].map((_, index) => (
              <div key={index} className={styles.skeletonCard}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorText}>Error: {error}</div>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.dashboardContainer} ${animateCards ? styles.loaded : ""}`}>
      <h1 className={styles.welcomeMessage}>
        <span className={styles.welcomeText}>DASHBOARD OVERVIEW</span>
        <div className={styles.welcomeUnderline}></div>
      </h1>

      <div className={styles.statsRow}>
        <div className={styles.quickStats}>
          {[
            { value: issueCounts.total, label: "Total Issues", delay: "0.1s" },
            { value: issueCounts.resolved, label: "Resolved", delay: "0.2s" },
            { value: issueCounts.inProgress, label: "In Progress", delay: "0.3s" },
            { value: issueCounts.pending, label: "Pending", delay: "0.4s" },
            { value: issueCounts.onHold, label: "On Hold", delay: "0.5s" },
            { value: issueCounts.escalated, label: "Escalated", delay: "0.6s" },
          ].map((stat, index) => (
            <div key={index} className={styles.statItem} style={{ animationDelay: stat.delay }}>
              <div className={styles.statValue}>
                <span className={styles.countUp}>{stat.value}</span>
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statGlow}></div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {/* Issue Summary Section */}
        <div
          className={`${styles.dashboardCard} ${styles.issuesCard}`}
          onClick={handleTotalIssuesClick}
          style={{ animationDelay: "0.6s" }}
        >
          <div className={styles.cardIcon}>
            <img src={totalIssuesIcon || "/placeholder.svg"} alt="Total issues Icon" className={styles.icon} />
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>Issue Summary</h2>
            <div className={styles.cardStats}>
              <div className={styles.statBubble}>
                <span className={styles.statNumber}>{issueCounts.total}</span>
                <span className={styles.statText}>Total</span>
              </div>
              <div className={styles.statBubble}>
                <span className={styles.statNumber}>{openIssues}</span>
                <span className={styles.statText}>Open</span>
              </div>
            </div>
            <p className={styles.cardDescription}>View detailed breakdown of all issues by status</p>
          </div>
          <div className={styles.cardHoverEffect}></div>
        </div>

        {/* Active Issues Section */}
        <div
          className={`${styles.dashboardCard} ${styles.openIssuesCard}`}
          onClick={handleOpenIssuesClick}
          style={{ animationDelay: "0.7s" }}
        >
          <div className={styles.cardIcon}>
            <img src={openIssuesIcon || "/placeholder.svg"} alt="Open Issues Icon" className={styles.icon} />
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>Active Issues</h2>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${(issueCounts.resolved / openIssues) * 100}%`,
                    animationDelay: "1s",
                  }}
                ></div>
              </div>
              <div className={styles.progressText}>
                {issueCounts.total > 0 ? Math.round((issueCounts.resolved / openIssues) * 100) : 0}% Resolved
              </div>
              <div className={styles.statBubble}>
                <span className={styles.statNumber}>{openIssues}</span>
                <span className={styles.statText}>Open Issues</span>
              </div>
            </div>
          </div>
          <div className={styles.cardHoverEffect}></div>
        </div>
      </div>

      {/* Manage Technicians Section */}
      <div
        className={`${styles.dashboardCard} ${styles.techCard}`}
        onClick={handleManageTechClick}
        style={{ animationDelay: "0.8s" }}
      >
        <div className={styles.cardIcon}>
          <FontAwesomeIcon icon={faUsers} className={styles.icon} />
          <div className={styles.iconGlow}></div>
        </div>
        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>Manage Technicians</h2>
          <div className={styles.cardStats}>
            <div className={styles.statBubbleLarge}>
              <span className={styles.statNumber}>{stats.techniciansCount}</span>
              <span className={styles.statText}>Active Technicians</span>
            </div>
          </div>
          <p className={styles.cardDescription}>Manage technician assignments and performance</p>
        </div>
        <div className={styles.cardHoverEffect}></div>
      </div>

      {/* Recent Activity Section */}
      <div className={styles.activitySection} style={{ animationDelay: "0.9s" }}>
        <h2 className={styles.sectionTitle}>
          <span>Recent Activity</span>
          <div className={styles.titleUnderline}></div>
        </h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem} style={{ animationDelay: "1s" }}>
            <div className={styles.activityIconWrapper}>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.activityIcon} />
              <div className={styles.activityIconPulse}></div>
            </div>
            <div className={styles.activityText}>
              <strong>{issueCounts.resolved} issues</strong> resolved this week
            </div>
            <div className={styles.activityTime}>{stats.resolvedThisWeek} this week</div>
          </div>
          <div className={styles.activityItem} style={{ animationDelay: "1.1s" }}>
            <div className={styles.activityIconWrapper}>
              <FontAwesomeIcon icon={faClock} className={styles.activityIcon} />
              <div className={styles.activityIconPulse}></div>
            </div>
            <div className={styles.activityText}>
              <strong>{issueCounts.escalated} issues</strong> Escalated
            </div>
            <div className={styles.attention}>Requiring attention</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
