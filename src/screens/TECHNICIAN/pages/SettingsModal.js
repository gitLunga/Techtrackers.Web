import React, { useState, useEffect } from "react";
import "../SidebarCSS/SettingsModal.css"; // Create this CSS file for styling the modal

const SettingsModal = ({ isOpen, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Load saved theme and font size from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedFontSize = localStorage.getItem("fontSize");

    if (savedTheme === "dark") setIsDarkMode(true);
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, []);

  // Toggle between Dark Mode and Light Mode
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode", !isDarkMode); // Applies 'dark-mode' class to body
    localStorage.setItem("theme", newTheme); // Save the theme preference
  };

  // Handle font size changes and save to localStorage
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    document.body.style.fontSize = `${size}px`; // Change font size globally
    localStorage.setItem("fontSize", size); // Save the font size preference
  };

  // Close the modal if it's not open
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal-content">
          {/* Dark Mode Toggle */}
          <div className="settings-option">
            <label>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              Dark Mode
            </label>
          </div>

          {/* Font Size Options */}
          <div className="settings-option">
            <h3>Font Size</h3>
            <button onClick={() => handleFontSizeChange(14)}>Small</button>
            <button onClick={() => handleFontSizeChange(16)}>Default</button>
            <button onClick={() => handleFontSizeChange(18)}>Large</button>
            <button onClick={() => handleFontSizeChange(20)}>
              Extra Large
            </button>
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="close-modal-button">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
