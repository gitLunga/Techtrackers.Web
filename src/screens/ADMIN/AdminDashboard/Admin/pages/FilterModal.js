"use client"

import { useState } from "react"
import styles from "../SidebarCSS/Modal.module.css"

export default function FilterModal({ onClose, onFilter }) {
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onFilter(filters)
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Filter Logs</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="priority">Priority:</label>
            <select
              id="priority"
              name="priority"
              value={filters.priority}
              onChange={handleChange}
              className={styles.formSelect}
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleChange}
              className={styles.formSelect}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className={styles.modalButtons}>
            <button type="submit" className={styles.applyButton}>
              Apply Filters
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
