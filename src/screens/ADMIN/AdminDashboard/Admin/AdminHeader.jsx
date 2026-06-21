"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaBars } from "react-icons/fa"
import styles from "./SidebarCSS/AdminHeaderStyle.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons"
import logo from "./adminIcons/tut.png"
import ProfileIcon from "./adminIcons/profile_icon.png"
import SettingsModal from "./pages/SettingsModal"

const AdminHeader = ({ onLogout, onToggleSidebar, isSidebarOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"))
    setUser(userInfo)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize() // Check initial size
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const closeDropdown = () => setIsDropdownOpen(false)

  const handleLogout = () => {
    localStorage.removeItem("user_info")
    closeDropdown()
    onLogout()
    navigate("/signIn")
  }

  return (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <img src={logo || "/placeholder.svg"} alt="Logo" className={styles.logo} />
      </div>

      <div className={styles.headerRight}>
        {/* Mobile hamburger menu */}
        {isMobile && (
          <button className={styles.mobileMenuToggle} onClick={onToggleSidebar} aria-label="Toggle menu">
            <FaBars />
          </button>
        )}

        <div ref={dropdownRef} className={styles.profileSection}>
          <button id="profile-button" onClick={toggleDropdown} className={styles.profileButton}>
            <img src={ProfileIcon || "/placeholder.svg"} alt="Profile Icon" className={styles.profileIcon} />
            <span className={styles.profileName}>{user ? `${user.name}` : "Admin Name"}</span>
          </button>
          {isDropdownOpen && (
            <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.open : ""}`}>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user ? `${user.name}` : "Name Surname"}</p>
                <p className={styles.subText}>{user ? user.email : "EzraAdmin.com"}</p>
                <p className={styles.subText}>{user ? user.department : "ICT"}</p>
              </div>

              <button
                className={styles.dropdownButton}
                onClick={() => {
                  closeDropdown()
                  setIsSettingsOpen(true)
                }}
              >
                Settings
              </button>
              <button className={styles.signoutButton} onClick={handleLogout}>
                <span className={styles.signoutIcon}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </span>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render the Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  )
}

export default AdminHeader
