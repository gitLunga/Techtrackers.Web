"use client"

import { useState, useEffect } from "react"
import styles from "./StaffStyle/SettingsModal.module.css"

const SettingsModal = ({ isOpen, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [language, setLanguage] = useState("en")

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const savedFontSize = localStorage.getItem("fontSize")
    const savedNotifications = localStorage.getItem("notifications")
    const savedSound = localStorage.getItem("soundEnabled")
    const savedLanguage = localStorage.getItem("language")

    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.body.classList.add("dark-mode")
    }

    if (savedFontSize) {
      const size = Number.parseInt(savedFontSize)
      setFontSize(size)
      document.body.style.fontSize = `${size}px`
    }

    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true")
    }

    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true")
    }

    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Toggle between Dark Mode and Light Mode
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle("dark-mode", !isDarkMode)
    localStorage.setItem("theme", newTheme)
  }

  // Handle font size changes
  const handleFontSizeChange = (size) => {
    setFontSize(size)
    document.body.style.fontSize = `${size}px`
    localStorage.setItem("fontSize", size)
  }

  // Handle notification toggle
  const toggleNotifications = () => {
    const newValue = !notifications
    setNotifications(newValue)
    localStorage.setItem("notifications", newValue.toString())
  }

  // Handle sound toggle
  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem("soundEnabled", newValue.toString())
  }

  // Handle language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  // Reset all settings
  const resetSettings = () => {
    setIsDarkMode(false)
    setFontSize(16)
    setNotifications(true)
    setSoundEnabled(true)
    setLanguage("en")

    document.body.classList.remove("dark-mode")
    document.body.style.fontSize = "16px"

    localStorage.removeItem("theme")
    localStorage.removeItem("fontSize")
    localStorage.removeItem("notifications")
    localStorage.removeItem("soundEnabled")
    localStorage.removeItem("language")
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.settingsModalOverlay} onClick={onClose}>
      <div className={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Settings</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Appearance Section */}
          <div className={styles.settingsSection}>
            <h3>Appearance</h3>

            <div className={styles.settingsOption}>
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className={styles.toggleInput} />
                <span className={styles.toggleSlider}></span>
                <span className={styles.labelText}>Dark Mode</span>
              </label>
            </div>

            <div className={styles.settingsOption}>
              <h4>Font Size</h4>
              <div className={styles.fontSizeButtons}>
                {[
                  { size: 14, label: "Small" },
                  { size: 16, label: "Default" },
                  { size: 18, label: "Large" },
                  { size: 20, label: "Extra Large" },
                ].map(({ size, label }) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`${styles.fontSizeButton} ${fontSize === size ? styles.active : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className={styles.settingsSection}>
            <h3>Notifications</h3>

            <div className={styles.settingsOption}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={toggleNotifications}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.labelText}>Enable Notifications</span>
              </label>
            </div>

            <div className={styles.settingsOption}>
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={soundEnabled} onChange={toggleSound} className={styles.toggleInput} />
                <span className={styles.toggleSlider}></span>
                <span className={styles.labelText}>Sound Notifications</span>
              </label>
            </div>
          </div>

          {/* Language Section */}
          <div className={styles.settingsSection}>
            <h3>Language</h3>
            <div className={styles.settingsOption}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={styles.languageSelect}
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">Zulu</option>
                <option value="xh">Xhosa</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={resetSettings} className={styles.resetButton}>
            Reset to Default
          </button>
          <button onClick={onClose} className={styles.closeModalButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
