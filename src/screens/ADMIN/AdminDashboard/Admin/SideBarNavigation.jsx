"use client"

import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Sidebar from "./AdminSidebar"
import DashboardPage from "./pages/DashboardPage"
import AddTechPage from "./pages/AddTechPage"
import NotificationsPage from "./pages/NotificationsPage"
import ViewAllLogs from "./pages/ViewAllLogs"
import ReportPage from "./pages/ReportPage"
import LogIssue from "./pages/LogIssue"
import AssignTech from "./pages/AssignTech"
import MyIssues from "./pages/MyIssues"
import AdminHeader from "./AdminHeader"
import useIssues from "./pages/useIssues"
import IssueDetails from "./pages/IssueDetails"
import ManageTech from "./pages/ManageTech"
import TechnicianAdded from "./pages/TechnicianAdded"
import NotifView from "./pages/NotifView"
import IssuesStatusReport from "./pages/IssuesStatusReport"
import MonthlySummaryReport from "./pages/MonthlySummaryReport"
import TechnicianPerformanceReport from "./pages/TechnicianPerformanceReport"
import IssueSummaryPage from "./pages/IssueSummaryPage"
import InProgressIssuesPage from "./pages/InProgressIssuesPage"
import Departments from "./pages/Departments"
import CreateDepartment from "./pages/CreateDepartment "
import ManageDepartments from "./pages/ManageDepartments"
import CreateCategory from "./pages/CreateCategory"
import ManageCategories from "./pages/ManageCategories"
import CreateUserRole from "./pages/CreateUserRole"
import ManageUserRoles from "./pages/ManagUserRoles"

import "./SidebarCSS/SidebarNavStyle.css"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { issues, setIssues } = useIssues()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("user_info")
    navigate("/login")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="admin-dashboard">
      <AdminHeader onLogout={handleLogout} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/viewAllLogs" element={<ViewAllLogs />} />
          <Route path="/logIssue" element={<LogIssue />} />
          <Route path="/assignTech" element={<AssignTech />} />
          <Route path="/myIssues" element={<MyIssues issues={issues} setIssues={setIssues} />} />
          <Route path="/add-tech" element={<AddTechPage />} />
          <Route path="/report-page" element={<ReportPage />} />
          <Route path="/status-report" element={<IssuesStatusReport />} />
          <Route path="/monthly-summary-report" element={<MonthlySummaryReport />} />
          <Route path="/technician-performance-report" element={<TechnicianPerformanceReport />} />
          <Route path="/TechnicianAdded" element={<TechnicianAdded />} />
          <Route path="/issue-details/:issueId" element={<IssueDetails issues={useIssues} />} />
          <Route path="/notif-view" element={<NotifView />} />
          <Route path="/ManageTech" element={<ManageTech />} />
          <Route path="/Departments" element={<Departments />} />
          <Route path="/issue-summary" element={<IssueSummaryPage />} />
          <Route path="/in-progress-issues" element={<InProgressIssuesPage />} />
          <Route path="/CreateDepartment" element={<CreateDepartment />} />
          <Route path="/ManageDepartments" element={<ManageDepartments />} />
          <Route path="/createCategory" element={<CreateCategory />} />
          <Route path="/manageCategories" element={<ManageCategories />} />
          <Route path="/createUserRole" element={<CreateUserRole />} />
          <Route path="/manageUserRoles" element={<ManageUserRoles />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard
