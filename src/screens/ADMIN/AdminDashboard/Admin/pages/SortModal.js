import styles from "../SidebarCSS/Modal.module.css"

export default function SortModal({ onClose, onSort }) {
  const handleSort = (key, direction) => {
    onSort(key, direction)
    onClose()
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const sortOptions = [
    { key: "date", direction: "desc", label: "Date (Newest First)" },
    { key: "date", direction: "asc", label: "Date (Oldest First)" },
    { key: "priority", direction: "desc", label: "Priority (High to Low)" },
    { key: "priority", direction: "asc", label: "Priority (Low to High)" },
  ]

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Sort Logs</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className={styles.sortOptions}>
          {sortOptions.map((option, index) => (
            <button key={index} onClick={() => handleSort(option.key, option.direction)} className={styles.sortOption}>
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.modalButtons}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
