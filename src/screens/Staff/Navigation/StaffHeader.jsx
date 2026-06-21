"use client"

import { useState, useEffect, useRef } from "react"
import "../StaffStyle/StaffHeaderStyle.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons"
import { FaBars } from "react-icons/fa" // Import menu icon
import SettingsModal from "../SettingsModal" // Import the modal
import logo from "./IconsForStaff/tut.png"

const StaffHeader = ({ onLogout, toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [user, setUser] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"))
    setUser(userInfo)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
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

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logo || "/placeholder.svg"} alt="Logo" className="logo" />
      </div>
      <div className="header-right" ref={dropdownRef}>
        <div className="user-display">{user && <span className="user-name">{user.name}</span>}</div>
        <button id="profile-button" onClick={toggleDropdown} className="profile-button" aria-label="Profile">
          <FontAwesomeIcon icon={faUser} />
        </button>

        {/* Mobile Menu Icon (calls toggleSidebar) */}
        {isMobile && (
          <button onClick={toggleSidebar} className="menuIcon" aria-label="Toggle Menu">
            <FaBars />
          </button>
        )}

        {isDropdownOpen && (
          <div className={`dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
            <p>{user ? `${user.name}` : "Name Surname"}</p>
            <p className="sub-text">{user ? user.email : "Joestaff.com"}</p>
            <p className="sub-text">{user ? user.department : "HR"}</p>
            <button
              onClick={() => {
                closeDropdown()
                setIsSettingsOpen(true)
              }}
              className="btn1"
            >
              Settings
            </button>
            <button
              className="signout-button"
              onClick={() => {
                closeDropdown()
                localStorage.removeItem("user_info")
                onLogout()
              }}
            >
              <span className="signout-icon">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      {/* Render the Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  )
}

export default StaffHeader
