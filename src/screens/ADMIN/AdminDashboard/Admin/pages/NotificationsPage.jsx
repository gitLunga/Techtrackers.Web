import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "../SidebarCSS/NotificationPage.module.css";
import { useNavigate } from "react-router-dom";
import NotifiIcon from "../adminIcons/notifMainIcon.png";
import FiltIcon from "../adminIcons/FiltIcon.png";
import SortIcon from "../adminIcons/SortIcon.png";
import AvatarIcon from "../adminIcons/avatarIcon.png";
import SearchIcon from "../adminIcons/searchIcon.png";
import debounce from "lodash.debounce";

const Header = ({
  onSortChange,
  onFilterChange,
  filterDropdownOpen,
  sortDropdownOpen,
  toggleSortDropdown,
  toggleFilterDropdown,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.notificationIcon}>
          <img src={NotifiIcon} width="30" height="30" alt="Notification Icon" />
        </div>
        <h2>NOTIFICATIONS</h2>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search Notifications"
          />
          <img
            src={SearchIcon}
            width="10"
            height="10"
            alt="Search Icon"
            className={styles.searchIcon}
          />
        </div>
        <div className={styles.filterContainer}>
          <button
            className={styles.filterBtn}
            onClick={toggleFilterDropdown}
            aria-expanded={filterDropdownOpen}
          >
            <img src={FiltIcon} width="15" height="15" alt="Filter Icon" /> Filter
          </button>
          {filterDropdownOpen && (
            <ul className={styles.filterDropdown}>
              <li onClick={() => onFilterChange("All")}>All</li>
              <li onClick={() => onFilterChange("ALERT")}>ALERT</li>
              <li onClick={() => onFilterChange("INFORMATION")}>INFORMATION</li>
              <li onClick={() => onFilterChange("WARNING")}>WARNING</li>
            </ul>
          )}
        </div>
        <div className={styles.sortContainer}>
          <button
            className={styles.sortBtn}
            onClick={toggleSortDropdown}
            aria-expanded={sortDropdownOpen}
          >
            <img src={SortIcon} width="15" height="15" alt="Sort Icon" /> Sort
          </button>
          {sortDropdownOpen && (
            <ul className={styles.sortDropdown}>
              <li onClick={() => onSortChange("recent")}>Recent</li>
              <li onClick={() => onSortChange("asc")}>Ascending Date</li>
              <li onClick={() => onSortChange("desc")}>Descending Date</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const Notification = () => {
  const [data, setData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user_info"));
      const userId = userInfo ? userInfo.userId : null;

      if (!userId) {
        throw new Error("User ID not found in localStorage.");
      }

      const response = await fetch(
        `https://localhost:44328/api/Log/GetNotifications/${userId}?onlyUnread=false`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications from the API.");
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSortChange = (sortBy) => {
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);

      return sortBy === "asc"
        ? dateA - dateB
        : sortBy === "desc"
          ? dateB - dateA
          : 0;
    });

    setData(sortedData);
    setSortDropdownOpen(false);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setFilterDropdownOpen(false);
  };



  const debouncedSearchChange = useMemo(
    () => debounce((query) => setSearchQuery(query),),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearchChange.cancel();
    };
  }, [debouncedSearchChange]);

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (filterStatus !== "All" && item.type !== filterStatus) return false;
        if (!searchQuery) return true;
        return (
          item.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }),
    [data, filterStatus, searchQuery]
  );

  const toggleSortDropdown = () => {
    setSortDropdownOpen((prev) => !prev);
    setFilterDropdownOpen(false);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownOpen((prev) => !prev);
    setSortDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <Header
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onSearchChange={debouncedSearchChange}
        searchQuery={searchQuery}
        filterDropdownOpen={filterDropdownOpen}
        sortDropdownOpen={sortDropdownOpen}
        toggleSortDropdown={toggleSortDropdown}
        toggleFilterDropdown={toggleFilterDropdown}
      />
      {error && <div className={styles.error}>{error}</div>}
      {filteredData.length === 0 && !error && (
        <div className={styles.noResults}>No notifications found.</div>
      )}
      {filteredData.map((row, index) => (
        <div key={index} className={styles.row}>
          <div className={styles.userInfo}>
            <img src={AvatarIcon} width="44" height="44" alt="User Icon" />
            <div className={styles.userText}>
              <strong>{row.message}</strong> - Type: <span>{row.type}</span>
            </div>
          </div>
          <div className={styles.rowFooter}>
            <span className={styles.time}>
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(row.timestamp))}
            </span>
            <button
              className={styles.viewBtn}
              onClick={() =>
                navigate("/admindashboard/notif-view", { state: row })
              }
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;