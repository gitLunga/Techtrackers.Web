"use client"

import { useState, useEffect } from "react"
import { FaBars } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "./SidebarCSS/SideBar.css"
import dashboard from "./adminIcons/dashIcon.png"
import notifications from "./adminIcons/notifIcon.png"
import issueIcon from "./adminIcons/issueIcon.png"
import addTechnician from "./adminIcons/addIcon.png"
import genetIcon from "./adminIcons/generIcon.png"
import logIcon from "./adminIcons/logIcon.png"
import dropIcon from "./adminIcons/dropicon.png"

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate()
  const [isIssueDropdownOpen, setIssueDropdownOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleIssueClick = () => {
    setIssueDropdownOpen((prev) => !prev)
    if (!isOpen && !isMobile) {
      onToggle()
    }
  }

  const handleItemClick = (option, path, closeDropdown = true) => {
    setSelectedOption(option)
    if (closeDropdown) {
      setIssueDropdownOpen(false)
    }
    // Close sidebar on mobile after navigation
    if (isMobile) {
      onToggle()
      setIssueDropdownOpen(false)
    }
    navigate(path)
  }

  const handleSignOut = () => {
    navigate("/signin")
  }

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      onToggle()
      setIssueDropdownOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && <div className="sidebar-overlay" onClick={handleOverlayClick}></div>}

      <div className={`sidebarContainer ${isOpen ? "open" : ""}`}>
        {/* Desktop hamburger menu - only show on desktop */}
        {!isMobile && (
          <div className="menu-icon" onClick={onToggle}>
            {isOpen && <span className="admin-name">HOD</span>}
            <FaBars />
          </div>
        )}

        {/* Mobile header - only show on mobile when sidebar is open */}
        {isMobile && isOpen && (
          <div className="mobile-sidebar-header">
            <span className="admin-name">HOD</span>
          </div>
        )}

        <ul>
          <li
            onClick={() => handleItemClick("dashboard", "/admindashboard/dashboard")}
            className={`list ${selectedOption === "dashboard" ? "selected" : ""}`}
          >
            <img src={dashboard || "/placeholder.svg"} alt="Dashboard" className="sidebar-container-icon" />
            {isOpen && <span>DASHBOARD</span>}
          </li>
          <li
            onClick={() => handleItemClick("notifications", "/admindashboard/notifications")}
            className={`list ${selectedOption === "notifications" ? "selected" : ""}`}
          >
            <img src={notifications || "/placeholder.svg"} alt="Notifications" className="sidebar-container-icon" />
            {isOpen && <span>NOTIFICATIONS</span>}
          </li>

          <li onClick={handleIssueClick} className={`list`}>
            <img src={issueIcon || "/placeholder.svg"} alt="issues" className="sidebar-container-icon" />
            {isOpen && <span>ISSUES</span>}
            {isOpen && (
              <img
                src={dropIcon || "/placeholder.svg"}
                alt="dropdown arrow"
                className={`drop-icon ${isIssueDropdownOpen ? "rotate" : ""}`}
              />
            )}
          </li>

          {isIssueDropdownOpen && (
            <ul className="dropdown">
              <li
                onClick={() => handleItemClick("viewAllLogs", "/admindashboard/viewAllLogs", false)}
                className={`dropdown-item ${selectedOption === "viewAllLogs" ? "selected" : ""}`}
              >
                {isOpen && <span>VIEW ALL LOGS</span>}
              </li>
              <li
                onClick={() => handleItemClick("logIssue", "/admindashboard/logIssue", false)}
                className={`dropdown-item ${selectedOption === "logIssue" ? "selected" : ""}`}
              >
                {isOpen && <span>LOG ISSUE</span>}
              </li>
              <li
                onClick={() => handleItemClick("assignTech", "/admindashboard/assignTech", false)}
                className={`dropdown-item ${selectedOption === "assignTech" ? "selected" : ""}`}
              >
                {isOpen && <span>ASSIGN TECHNICIAN</span>}
              </li>
              <li
                onClick={() => handleItemClick("myIssues", "/admindashboard/myIssues", false)}
                className={`dropdown-item ${selectedOption === "myIssues" ? "selected" : ""}`}
              >
                {isOpen && <span>MY ISSUES</span>}
              </li>
            </ul>
          )}

          <li
            onClick={() => handleItemClick("add-tech", "/admindashboard/add-tech")}
            className={`list ${selectedOption === "add-tech" ? "selected" : ""}`}
          >
            <img src={addTechnician || "/placeholder.svg"} alt="Add Technician" className="sidebar-container-icon" />
            {isOpen && <span>ADD TECHNICIAN</span>}
          </li>
          <li
            onClick={() => handleItemClick("report-page", "/admindashboard/report-page")}
            className={`list ${selectedOption === "report-page" ? "selected" : ""}`}
          >
            <img src={genetIcon || "/placeholder.svg"} alt="Generate Report" className="sidebar-container-icon" />
            {isOpen && <span>GENERATE REPORT</span>}
          </li>
        </ul>
        <div className="log-out">
          <li onClick={handleSignOut} className={`list`}>
            <img src={logIcon || "/placeholder.svg"} alt="Logout" />
            {isOpen && <span>LOGOUT</span>}
          </li>
        </div>
      </div>
    </>
  )
}

export default Sidebar
