"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Dashboard from "./WelcomeStaff"
import LogIssue from "./logissueform"
import AllIssue from "./IssueDisplay"
import Notification from "./IssueTracker"
import SideBar from "./Navigation/Sidebar"
import StaffHeader from "./Navigation/StaffHeader"

const StaffDashboard = () => {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768) // Default to open on desktop, closed on mobile

  // Handle window resize to set initial sidebar state
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768)
    }

    // Set initial state
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user_info")
    navigate("/login")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="dashboard-container">
      {/* Pass toggleSidebar to both Header and Sidebar */}
      <StaffHeader onLogout={handleLogout} toggleSidebar={toggleSidebar} />
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
        <Routes>
          <Route path="WelcomeStaff" element={<Dashboard />} />
          <Route path="logissueform" element={<LogIssue />} />
          <Route path="IssueDisplay" element={<AllIssue />} />
          <Route path="issueTracker" element={<Notification />} />
        </Routes>
      </SideBar>
    </div>
  )
}

export default StaffDashboard
