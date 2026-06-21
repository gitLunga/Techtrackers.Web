"use client"
import styles from "../Staff/StaffStyle/WelcomeStaff.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCirclePlus, faCircleCheck, faBell } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"

const WelcomeStaff = () => {
  const navigate = useNavigate()

  const handleAllIssues = () => {
    navigate("/staffdashboard/IssueDisplay")
  }

  const handleLogIssue = () => {
    navigate("/staffdashboard/logissueform")
  }

  const handleNotifications = () => {
    navigate("/staffdashboard/issueTracker")
  }


  // const handleSettings = () => {
  //   navigate("/staffdashboard/settings")
  // }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.welcomeHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.titles}>
            Welcome Back, <span className={styles.highlight}>Staff!</span>
          </h1>
          <p className={styles.subtitle}>Manage your tasks and stay updated with the latest system status</p>
        </div>
        
      </div>

      <div className={styles.cardsContainer}>
        {/* Primary Actions */}
        <div className={styles.primaryActions}>
          {/* Log Issue Card */}
          <div
            className={`${styles.cards} ${styles.logIssue} ${styles.primaryCard}`}
            onClick={handleLogIssue}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleLogIssue()}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardsIcon}>
                <FontAwesomeIcon icon={faCirclePlus} />
              </div>
              <div className={styles.cardBadge}>Quick Action</div>
            </div>
            <div className={styles.cardsContent}>
              <h2>Log New Issue</h2>
              <p>Report technical problems or request assistance with equipment and systems quickly and efficiently.</p>
              <div className={styles.cardFooter}>
                <span className={styles.actionText}>Click to start →</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div
            className={`${styles.cards} ${styles.statusCard} ${styles.primaryCard}`}
            onClick={handleAllIssues}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleAllIssues()}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardsIcon}>
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
              <div className={styles.cardBadge}>Track Progress</div>
            </div>
            <div className={styles.cardsContent}>
              <h2>Issue Status</h2>
              <p>Monitor the progress of your reported issues including pending, ongoing, and resolved cases.</p>
              <div className={styles.cardFooter}>
                <span className={styles.actionText}>View all issues →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className={styles.secondaryActions}>
          {/* Notifications Card */}
          <div
            className={`${styles.cards} ${styles.notificationCard}`}
            onClick={handleNotifications}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleNotifications()}
          >
            <div className={styles.cardsIcon}>
              <FontAwesomeIcon icon={faBell} />
              <div className={styles.notificationDot}></div>
            </div>
            <div className={styles.cardsContent}>
              <h3>Notifications</h3>
              <p>Stay updated with alerts and status changes</p>
            </div>
          </div>

        </div>
      </div>

      
      
    </div>
  )
}

export default WelcomeStaff
