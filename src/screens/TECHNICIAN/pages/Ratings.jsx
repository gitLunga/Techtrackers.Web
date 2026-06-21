
import {React, useState, useEffect } from "react"
import logo from "../images/user.png"
import styles from "../SidebarCSS/TechRatings.module.css"

const TechnicianDashboard = () => {
  const [technician, setTechnician] = useState({
    name: "",
    reviewPeriod: "2024-01-01 to 2024-09-30",
    totalReviews: 0,
    averageRating: 0,
    ratingsDistribution: [],
  })
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [animateStats, setAnimateStats] = useState(false)

  useEffect(() => {
    // Retrieve logged-in technician's details
    const userInfo = JSON.parse(localStorage.getItem("user_info"))
    const loggedInTechnicianName = userInfo?.name
    const loggedInTechnicianId = userInfo?.userId

    // Retrieve logs from localStorage
    const logs = JSON.parse(localStorage.getItem("Tech Issues"))

    // Filter logs assigned to the logged-in technician
    const assignedLogs = logs?.filter((log) => log.assignedTo === loggedInTechnicianName) || []
    const logIds = assignedLogs.map((log) => log.logId)

    // Set technician details
    setTechnician((prev) => ({
      ...prev,
      name: loggedInTechnicianName,
    }))

    const fetchFeedback = async () => {
      if (logIds.length === 0) {
        console.warn("No logs found for this technician.")
        setIsLoading(false)
        return
      }

      try {
        // Fetch feedback for each logId assigned to the technician
        const feedbackLists = await Promise.all(
          logIds.map(async (logId) => {
            const response = await fetch(`https://localhost:44328/api/Feedback/GetFeedbackByLog/${logId}`)
            if (response.ok) {
              return await response.json()
            } else {
              console.error(`Failed to fetch feedback for logId: ${logId}`)
              return []
            }
          }),
        )

        // Combine feedback from all logs into a single array
        const combinedFeedback = feedbackLists.flat()

        // Sort combined feedback by FeedbackTimestamp in descending order
        const sortedFeedback = combinedFeedback.sort(
          (a, b) => new Date(b.feedbackTimestamp) - new Date(a.feedbackTimestamp),
        )

        // Calculate total reviews, average rating, and ratings distribution
        const totalReviews = sortedFeedback.length
        const averageRating =
          totalReviews > 0 ? (sortedFeedback.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1) : 0

        const ratingsDistribution = [5, 4, 3, 2, 1].map((rating) => {
          const count = sortedFeedback.filter((item) => item.rating === rating).length
          const percentage = totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0

          return { rating, percentage, count }
        })

        // Save feedback data to localStorage (optional)
        localStorage.setItem(
          "tech_feedback",
          JSON.stringify({
            totalReviews,
            averageRating,
            ratingsDistribution,
          }),
        )

        // Update state with the feedback data
        setTechnician((prev) => ({
          ...prev,
          totalReviews,
          averageRating,
          ratingsDistribution,
        }))
        setReviews(sortedFeedback)

        // Trigger animation after data loads
        setTimeout(() => setAnimateStats(true), 100)
      } catch (error) {
        console.error("Error fetching feedback:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getProgressBarColor = (rating) => {
    const colors = {
      5: "#28a745",
      4: "#6f42c1",
      3: "#fd7e14",
      2: "#ffc107",
      1: "#dc3545",
    }
    return colors[rating] || "#6c757d"
  }

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.mainHeading}>Reviews Dashboard</h1>

      <div className={`${styles.gridContainer} ${animateStats ? styles.animate : ""}`}>
        {/* First Column: Rating Distribution */}
        <div className={styles.firstCol}>
          <h3 className={styles.columnTitle}>Rating Distribution</h3>
          {technician.ratingsDistribution.map((item, index) => (
            <div className={styles.ratingRow} key={item.rating} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.progressBarContainer}>
                <span className={styles.ratingNumber}>{item.rating}</span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{
                      width: animateStats ? `${item.percentage}%` : "0%",
                      backgroundColor: getProgressBarColor(item.rating),
                    }}
                  >
                    <span className={styles.percentageText}>{item.percentage}%</span>
                  </div>
                </div>
                <span className={styles.userRating}>{item.count}</span>
              </div>
            </div>
          ))}
          <div className={styles.columnDivider}></div>
        </div>

        {/* Second Column: Average Rating */}
        <div className={styles.secondCol}>
          <div className={styles.ratingSummary}>
            <h2 className={styles.ratingValue}>{technician.averageRating}</h2>
            <p className={styles.ratingLabel}>Average Rating</p>
            <div className={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`${styles.star} ${star <= Math.round(technician.averageRating) ? styles.filled : styles.empty}`}
                  style={{ animationDelay: `${star * 0.1}s` }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className={styles.columnDivider}></div>
        </div>

        {/* Third Column: Total Reviews */}
        <div className={styles.thirdCol}>
          <h3 className={styles.columnTitle}>Total Reviews</h3>
          <div className={styles.totalReviewsContainer}>
            <p className={styles.totalReviewsNumber}>{technician.totalReviews}</p>
            <p className={styles.reviewPeriod}>{technician.reviewPeriod}</p>
          </div>
        </div>
      </div>

      {/* User Reviews Section */}
      <section className={styles.userReviews}>
        <div className={styles.reviewsHeader}>
          <h4>User Feedback</h4>
          <div className={styles.reviewsCount}>
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className={styles.userReviewsContainer}>
            {reviews.map((review, index) => (
              <div className={styles.userReview} key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={styles.userDetails}>
                  <div className={styles.userImageContainer}>
                    <img src={logo || "/placeholder.svg"} alt={`User ${index + 1}`} className={styles.userImage} />
                    <div className={styles.userImageOverlay}>
                      <span className={styles.userInitial}>U</span>
                    </div>
                  </div>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>User {index + 1}</p>
                    <p className={styles.reviewDate}>{formatDate(review.feedbackTimestamp)}</p>
                  </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.userFeedback}>
                  <div className={styles.userRatingContainer}>
                    <div className={styles.userRatingStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`${styles.reviewStar} ${star <= review.rating ? styles.filled : styles.empty}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className={styles.ratingValue}>({review.rating}/5)</span>
                  </div>
                  <p className={styles.reviewComment}>{review.comments || "No comment provided"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noReviews}>
            <div className={styles.noReviewsIcon}>📝</div>
            <p>No reviews available yet.</p>
            <p className={styles.noReviewsSubtext}>Keep up the great work to receive feedback!</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default TechnicianDashboard
