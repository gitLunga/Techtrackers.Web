import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from './Header';
import Sidebar from './Sidebar';
import HODDashboard from './HODDashboard';
// import LogIssueForm from './LogIssueForm';
import ManageLogs from './ManageLogs';
import GenerateReport from './GenerateReport/Report';
import Notification from '../Notification Page/Notification';
import IssueReport from './GenerateReport/IssuesStatusReport';
import MonthlyReport from './GenerateReport/MonthlySummaryReport';
import TechnicianReport from './GenerateReport/TechnicianPerformanceReport';
import styles from './HOD styles/HeadDepartment.module.css';


import MainContent from './MainContent';
function HeadDepartment() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (

      <div className={styles.app}>
        <Header />
        <div className={styles.mainContent}>
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div className={styles.content}>
            <Routes>
            <Route path="/hod-dashboard" element={<HODDashboard isSidebarOpen={isSidebarOpen} />} />
              <Route path="/manage-logs" element={<ManageLogs isSidebarOpen={isSidebarOpen} />} />
              {/* <Route path="/log-issue" element={<LogIssueForm isSidebarOpen={isSidebarOpen} />} /> */}
              <Route path="/all-issues" element={<MainContent isSidebarOpen={isSidebarOpen}/>} />
              <Route path="/generate-report" element={<GenerateReport isSidebarOpen={isSidebarOpen}/>} />
              <Route path="/status-report" element={<IssueReport isSidebarOpen={isSidebarOpen}/>} />
              <Route path="/monthly-summary-report" element={<MonthlyReport isSidebarOpen={isSidebarOpen}/>} />
              <Route path="/technician-performance-report" element={<TechnicianReport isSidebarOpen={isSidebarOpen}/>} />
              <Route path="/notifications" element={<Notification isSidebarOpen={isSidebarOpen}/>} />
            </Routes>
          </div>
        </div>
      </div>
  );
}

export default HeadDepartment;
