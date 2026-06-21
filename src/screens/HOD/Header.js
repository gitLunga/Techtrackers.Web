"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./Header.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faSignOutAlt, faBars } from "@fortawesome/free-solid-svg-icons"
import SettingsModal from "../Staff/SettingsModal"
import logo from "./Assets/tut_logo 2.png"
import { useNavigate } from "react-router-dom"

const HODHeader = ({ onLogout, onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"))
    setUser(userInfo)
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

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.hamburgerButton} onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <FontAwesomeIcon icon={faBars} />
        </button>
        <img src={logo || "/placeholder.svg"} alt="Logo" className={styles.logo} />
      </div>
      <div className={styles.headerRight} ref={dropdownRef}>
        <button
          id="profile-button"
          onClick={toggleDropdown}
          className={styles.profileButton}
          aria-expanded={isDropdownOpen ? "true" : "false"}
        >
          <FontAwesomeIcon icon={faUser} />
          {user ? `${user.name || "HOD"} ${user.surname || ""}` : "HOD Name"}
        </button>
        {isDropdownOpen && (
          <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.open : ""}`}>
            <p>{user ? `${user.name} ${user.surname}` : "Name Surname"}</p>
            <p className={styles.subText}>{user ? user.email : "hod@tut.ac.za"}</p>
            <p className={styles.subText}>{user ? user.department : "Department"}</p>
            <button
              onClick={() => {
                closeDropdown()
              }}
            >
              Profile
            </button>
            <button
              onClick={() => {
                closeDropdown()
                setIsSettingsOpen(true)
              }}
            >
              Settings
            </button>
            <button
              className={styles.signoutButton}
              onClick={() => {
                navigate("/login")
              }}
            >
              <span className={styles.signoutIcon}>
                <FontAwesomeIcon icon={faSignOutAlt} />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  )
}

export default HODHeader
