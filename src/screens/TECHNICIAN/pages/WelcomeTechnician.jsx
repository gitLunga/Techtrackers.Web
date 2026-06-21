"use client"

import { useState, useEffect } from "react"
import styles from "../SidebarCSS/WelcomeTechnician.module.css"
import arrow from "../images/Arrow.png"
import check_circle from "../images/Check.png"
import { useNavigate } from "react-router-dom"

const WelcomeTechnician = () => {
  // State for dynamic data
  const navigate = useNavigate()
  const [statusCounts, setStatusCounts] = useState({
    resolved: 0,
    inProgress: 0,
    onHold: 0,
    pending: 0,
  })

  const [tasks, setTasks] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setIsVisible(true), 100)

    const storedTasks = JSON.parse(localStorage.getItem("Tech Issues")) || []
    const lastTask = storedTasks[storedTasks.length - 1]
    setTasks(lastTask ? [lastTask] : [])

    const fetchStatusCounts = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user_info"))
        const technicianId = userInfo ? userInfo.userId : null

        if (!technicianId) {
          throw new Error("Technician ID is missing")
        }

        // Fetching data from the backend
        const resolvedResponse = await fetch(
          `https://localhost:44328/api/Tech/CountResolvedLogs/${technicianId}/countResolved`,
        )
        const inProgressResponse = await fetch(
          `https://localhost:44328/api/Tech/CountInProgressLogs/${technicianId}/countInProgress`,
        )
        const onHoldResponse = await fetch(
          `https://localhost:44328/api/Tech/CountOnHoldLogs/${technicianId}/countOnHold`,
        )
        const pendingResponse = await fetch(
          `https://localhost:44328/api/Tech/CountPendingLogs/${technicianId}/countPending`,
        )

        if (!resolvedResponse.ok || !inProgressResponse.ok || !onHoldResponse.ok || !pendingResponse.ok) {
          throw new Error("Failed to fetch status counts")
        }

        const resolvedData = await resolvedResponse.json()
        const inProgressData = await inProgressResponse.json()
        const onHoldData = await onHoldResponse.json()
        const pendingData = await pendingResponse.json()

        setStatusCounts({
          resolved: resolvedData,
          inProgress: inProgressData,
          onHold: onHoldData,
          pending: pendingData,
        })

        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchStatusCounts()
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>Error: {error}</p>
      </div>
    )
  }

  const handleViewClick = (issueId) => {
    localStorage.setItem("selected_log_id", issueId)
    navigate(`/techniciandashboard/issues/${issueId}`)
  }

  return (
    <div className={`${styles.mainContent1} ${isVisible ? styles.fadeInUp : ""}`}>
      {/* Top Container */}
      <div className={styles.topContainer}>
        <h2 className={`${styles.welcomeTitle} ${styles.typewriter}`}>WELCOME, TECHNICIAN!</h2>

        <div className={`${styles.cardsLeft} ${styles.slideInLeft}`}>
          <div className={styles.statusCards}>
            <div className={`${styles.cardLeft} ${styles.hoverFloat}`} style={{ animationDelay: "0.1s" }}>
              <div className={styles.cardContent}>
                <strong className={styles.countNumber}>{statusCounts.resolved}</strong>
                <p className={styles.cardLabel}>RESOLVED</p>
              </div>
              <div className={styles.cardGlow}></div>
            </div>
            <div className={`${styles.cardLeft} ${styles.hoverFloat}`} style={{ animationDelay: "0.2s" }}>
              <div className={styles.cardContent}>
                <strong className={styles.countNumber}>{statusCounts.inProgress}</strong>
                <p className={styles.cardLabel}>IN PROGRESS</p>
              </div>
              <div className={styles.cardGlow}></div>
            </div>
          </div>

          <div className={styles.statusCards2}>
            <div className={`${styles.cardLeft} ${styles.hoverFloat}`} style={{ animationDelay: "0.3s" }}>
              <div className={styles.cardContent}>
                <strong className={styles.countNumber}>{statusCounts.onHold}</strong>
                <p className={styles.cardLabel}>ON HOLD</p>
              </div>
              <div className={styles.cardGlow}></div>
            </div>
            <div className={`${styles.cardLeft} ${styles.hoverFloat}`} style={{ animationDelay: "0.4s" }}>
              <div className={styles.cardContent}>
                <strong className={styles.countNumber}>{statusCounts.pending}</strong>
                <p className={styles.cardLabel}>PENDING</p>
              </div>
              <div className={styles.cardGlow}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.cardsRight} ${styles.slideInRight}`}>
          <div className={`${styles.upcomingTasks} ${styles.hoverTilt}`}>
            <h4 className={styles.taskHeader}>
              <img src={arrow || "/placeholder.svg"} alt="arrow" height={50} className={styles.bounceIcon} />
              UPCOMING TASKS
            </h4>
            <p className={styles.taskDescription}>
              You have <span className={styles.highlight}>{statusCounts.pending}</span> new issues assigned to you.
            </p>
            <div className={styles.cardShimmer}></div>
          </div>
          <div className={`${styles.updateStatus} ${styles.hoverTilt}`}>
            <h4 className={styles.taskHeader}>
              <img src={check_circle || "/placeholder.svg"} alt="check" height={50} className={styles.pulseIcon} />
              UPDATE STATUS
            </h4>
            <p className={styles.taskDescription}>Update the issue status of pending, ongoing or resolved cases.</p>
            <div className={styles.cardShimmer}></div>
          </div>
        </div>
      </div>

      {/* Bottom Container */}
      <div className={`${styles.bottomContainer} ${styles.slideInUp}`}>
        {/* Active Tasks Section */}
        <div className={styles.activeTasks}>
          <h3 className={`${styles.activeTitle} ${styles.titleGlow}`}>Active Tasks</h3>
          <div className={styles.taskCards}>
            {tasks.map((task, index) => (
              <div
                key={index}
                className={`${styles.taskCard} ${styles[task.priority.toLowerCase()]} ${styles.hoverLift}`}
                onClick={() => handleViewClick(`${task.issueId}`)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h4 className={styles.issuesTitle}>{task.issueTitle}</h4>
                <p>
                  Priority: <span className={styles.priorityBadge}>{task.priority}</span>
                </p>
                <p>
                  Status: <span className={styles.statusBadge}>{task.status}</span>
                </p>
                <p className={styles.date}>{task.issuedAt}</p>

                {/* Enhanced Progress Bar */}
                <div className={styles.progressBarContainer}>
                  <div
                    className={`${styles.progressBar} ${styles.animatedProgress}`}
                    style={{
                      width:
                        task.status === "ESCALATED"
                          ? "100%"
                          : task.status === "INPROGRESS"
                            ? "50%"
                            : task.status === "CLOSED"
                              ? "100%"
                              : task.status === "PENDING"
                                ? "25%"
                                : task.status === "RESOLVED"
                                  ? "100%"
                                  : "20%",
                      backgroundColor:
                        task.status === "ESCALATED"
                          ? "red"
                          : task.status === "INPROGRESS"
                            ? "#14788f"
                            : task.status === "CLOSED"
                              ? "#808080"
                              : task.status === "PENDING"
                                ? "#ffa007"
                                : task.status === "RESOLVED"
                                  ? "#28a745"
                                  : "#ccc",
                    }}
                  >
                    <span className={styles.progressText}>
                      {task.status === "ESCALATED"
                        ? "100%"
                        : task.status === "INPROGRESS"
                          ? "70%"
                          : task.status === "CLOSED"
                            ? "100%"
                            : task.status === "PENDING"
                              ? "25%"
                              : task.status === "RESOLVED"
                                ? "100%"
                                : "20%"}
                    </span>
                    <div className={styles.progressGlow}></div>
                  </div>
                </div>
                <div className={styles.taskCardOverlay}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.myReviews}>
          <div className={`${styles.reviewBox} ${styles.hoverGlow}`}>
            <div className={styles.rating}>
              <h4 className={styles.reviewTitle}>My Reviews</h4>
              {(() => {
                const feedback = JSON.parse(localStorage.getItem("tech_feedback"))
                if (feedback) {
                  return (
                    <>
                      <div className={styles.stars}>
                        <h3 className={styles.ratingNumber}>{feedback.averageRating}</h3>
                        <div className={styles.starContainer}>
                          {Array(5)
                            .fill()
                            .map((_, i) => (
                              <span
                                key={i}
                                className={`${styles.star} ${i < Math.round(feedback.averageRating) ? styles.starFilled : styles.starEmpty}`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                              >
                                {i < Math.round(feedback.averageRating) ? "★" : "☆"}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className={styles.ratingBreakdown}>
                        {feedback.ratingsDistribution.map((item, index) => (
                          <div
                            className={styles.ratingItem}
                            key={item.rating}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <span className={styles.ratingLabel}>{item.rating}</span>
                            <div className={styles.bar}>
                              <div
                                className={`${styles.filled} ${styles.barFill}`}
                                style={{
                                  width: `${item.percentage}%`,
                                  animationDelay: `${index * 0.2}s`,
                                }}
                              ></div>
                            </div>
                            <span className={styles.ratingCount}>{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeTechnician
