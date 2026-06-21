import styles from "./ResponsiveTable.module.css"

/**
 * ResponsiveTable - A wrapper component for making tables responsive
 * Provides horizontal scrolling on mobile and card-style layout for very small screens
 */
const ResponsiveTable = ({ children, className = "", cardView = false, ...props }) => {
  return (
    <div className={`${styles.tableWrapper} ${cardView ? styles.cardView : ""} ${className}`} {...props}>
      <div className={styles.tableContainer}>{children}</div>
    </div>
  )
}

export default ResponsiveTable
