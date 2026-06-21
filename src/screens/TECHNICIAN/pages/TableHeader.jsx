import React, { useState, useEffect, useRef } from "react";
import styles from "../SidebarCSS/TableHeader.module.css";

const Header = ({ handleSort, handleFilter, handleSearch }) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("All"); // Track the selected filter value

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setShowFilterDropdown((prev) => !prev);
    setShowSortDropdown(false);
  };

  // Toggle sort dropdown
  const toggleSortDropdown = () => {
    setShowSortDropdown((prev) => !prev);
    setShowFilterDropdown(false);
  };

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const value = e.target.value.trim();
    setSearchTerm(value);

    if (value.toLowerCase() === "show all") {
      handleFilter({ key: null, value: null });
      handleSort(null);
      handleSearch("");
    } else {
      handleSearch(value);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterValue(value);

    handleFilter(value === "All" ? { key: null, value: null } : { key: "priority", value });
  };

  // Handle sorting changes
  const handleSortingOptionClick = (sortType) => {
    handleSort(sortType);
    setShowSortDropdown(false); // Close the sort dropdown after selection
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target) &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.headerContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <i
            className={`fa-regular fa-clock ${styles.faClock}`}
            aria-hidden="true"
          ></i>
          <div className={styles.headerText}>
            <h2>ALL ISSUES</h2>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/* Search Input */}
          <input
            type="text"
            id="searchInput"
            className={styles.searchInput}
            placeholder="Enter text..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            aria-label="Search issues"
          />
          <i className={`fa fa-search ${styles.search}`} aria-hidden="true"></i>

          <div className={styles.filterSortContainer}>
            {/* Filter Dropdown */}
            <div className={styles.filterDropdownContainer} ref={filterDropdownRef}>
              <button
                className={styles.filterButton1}
                onClick={toggleFilterDropdown}
                aria-expanded={showFilterDropdown ? "true" : "false"}
                aria-controls="filterDropdown"
              >
                <i className={`fa-solid fa-filter ${styles.filter}`} aria-hidden="true"></i> Filter
              </button>
              {showFilterDropdown && (
                <div className={styles.filterOptions} id="filterDropdown">
                  <select
                    value={filterValue} // Bind to state to track the selected filter value
                    onChange={handleFilterChange} // This will update the filter state
                    className={styles.filterSelect}
                    aria-label="Filter by priority"
                  >
                    {/* Filter options for different priority levels */}
                    <option value="All">All Priority Levels</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  {/* Show selected filter value */}
                  {filterValue !== "All" && (
                    <div className={styles.selectedFilterInfo}>
                      Selected: {filterValue} {/* Display the selected filter */}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className={styles.sortDropdownContainer} ref={sortDropdownRef}>
              <button
                className={styles.sortButton1}
                onClick={toggleSortDropdown}
                aria-expanded={showSortDropdown ? "true" : "false"}
                aria-controls="sortDropdown"
              >
                <i className={`fa-solid fa-list ${styles.listIcon}`} aria-hidden="true"></i> Sort
              </button>
              {showSortDropdown && (
                <div className={styles.sortOptions} id="sortDropdown">
                  <div
                    className={styles.sortOption}
                    onClick={() => handleSortingOptionClick("date-old-new")} // Sorting option
                  >
                    By date (ascending-order)
                  </div>
                  <div
                    className={styles.sortOption}
                    onClick={() => handleSortingOptionClick("date-new-old")} // Sorting option
                  >
                    By date (descending-order)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
