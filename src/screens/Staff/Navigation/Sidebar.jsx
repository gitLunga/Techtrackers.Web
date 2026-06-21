"use client"

import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import { FaBars } from "react-icons/fa"

// Import your custom icons
import dashboardIcon from "./IconsForStaff/dashboard.png"
import logIssueIcon from "./IconsForStaff/logIssueIcon.png"
import allIssuesIcon from "./IconsForStaff/allIssuesIcon.png"
import notificationsIcon from "./IconsForStaff/notifications.png"
import styles from "../StaffStyle/staffdashboard.module.css"

const SideBar = ({ children, isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const menuItem = [
    {
      path: "/staffdashboard/WelcomeStaff",
      name: "DASHBOARD",
      icon: dashboardIcon,
    },
    {
      path: "/staffdashboard/logissueform",
      name: "LOG ISSUE",
      icon: logIssueIcon,
    },
    {
      path: "/staffdashboard/IssueDisplay",
      name: "ALL ISSUE",
      icon: allIssuesIcon,
    },
    {
      path: "/staffdashboard/issueTracker",
      name: "NOTIFICATIONS",
      icon: notificationsIcon,
    },
  ]

  return (
    <div className={styles.cup}>
      <div className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ""}`}>
        <div className={styles.topSection}>
          <h1 style={{ display: isOpen && !isMobile ? "block" : "none" }} className={styles.staffTitle}>
            Staff
          </h1>
          <FaBars onClick={toggleSidebar} className={styles.bars} />
        </div>
        <div className={styles.ItemIcon}>
          {menuItem.map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              className={({ isActive }) => `${styles.Link} ${isActive ? styles.active : ""}`}
            >
              <img
                src={item.icon || "/placeholder.svg"}
                alt={item.name}
                className={styles.sidebarIcons}
                width="24"
                height="24"
              />
              <span className={styles.NavItem} style={{ display: isMobile ? "none" : isOpen ? "inline" : "none" }}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>
      </div>

      <main className={!isOpen ? styles.sidebarCollapsed : ""}>{children}</main>
    </div>
  )
}

export default SideBar
