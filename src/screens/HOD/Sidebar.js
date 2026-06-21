import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css"; // Import CSS module
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation(); // Get current route path
  const navigate = useNavigate(); 
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.menuIcon} onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>

      <nav className={styles.sidebarNav}>
        <ul>
          <li className={location.pathname === "/headdepartment/hod-dashboard" ? styles.active : ""}>
            <Link to="/headdepartment/hod-dashboard" className={styles.menuLink}>
              <i className="fas fa-home"></i>
              <span className={styles.menuText}>Dashboard</span>
            </Link>
          </li>
          {/* <li className={location.pathname === "/headdepartment/log-issue" ? styles.active : ""}>
            <Link to="/headdepartment/log-issue" className={styles.menuLink}>
              <i className="fas fa-plus-circle"></i>
              <span className={styles.menuText}>Log Issue</span>
            </Link>
          </li> */}
          <li className={location.pathname === "/headdepartment/all-issues" ? styles.active : ""}>
            <Link to="/headdepartment/all-issues" className={styles.menuLink}>
              <i className="fas fa-list"></i>
              <span className={styles.menuText}>All Issues</span>
            </Link>
          </li>
          <li className={location.pathname === "/headdepartment/manage-logs" ? styles.active : ""}>
            <Link to="/headdepartment/manage-logs" className={styles.menuLink}>
              <i className="fas fa-tasks"></i>
              <span className={styles.menuText}>Manage Logs</span>
            </Link>
          </li>
          <li className={location.pathname === "/headdepartment/generate-report" ? styles.active : ""}>
            <Link to="/headdepartment/generate-report" className={styles.menuLink}>
              <i className="fas fa-chart-line"></i>
              <span className={styles.menuText}>Generate Report</span>
            </Link>
          </li>
          <li className={location.pathname === "/headdepartment/notifications" ? styles.active : ""}>
            <Link to="/headdepartment/notifications" className={styles.menuLink}>
              <i className="fas fa-bell"></i>
              <span className={styles.menuText}>Notifications</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.logoutSection} >
        <i className={`fas fa-sign-out-alt ${styles.logoutIcon}`} onClick={() => navigate("/login")}></i>
      </div>
    </div>
  );
}
