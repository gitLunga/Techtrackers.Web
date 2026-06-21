import React, { useState, useEffect } from 'react';
import styles from './StaffStyle/NotificationIssue.module.css';
import { FaBell, FaSearch, FaInfoCircle } from 'react-icons/fa';

const NotificationContainer = () => {
  const [notificationsState, setNotificationsState] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeTab, setActiveTab] = useState('unread');
  const [filterOption, setFilterOption] = useState('all');

  // Define filter options with time-based conditions
  const filterOptions = {
    all: { label: "All", filter: () => true },
    today: {
      label: "Today",
      filter: (notification) => {
        const now = new Date();
        const notificationDate = new Date(notification.timestamp);
        return (
          notificationDate.getDate() === now.getDate() &&
          notificationDate.getMonth() === now.getMonth() &&
          notificationDate.getFullYear() === now.getFullYear()
        );
      },
    },
    thisWeek: {
      label: "This Week",
      filter: (notification) => {
        const now = new Date();
        const notificationDate = new Date(notification.timestamp);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return notificationDate >= startOfWeek;
      },
    },
    thisMonth: {
      label: "This Month",
      filter: (notification) => {
        const now = new Date();
        const notificationDate = new Date(notification.timestamp);
        return (
          notificationDate.getMonth() === now.getMonth() &&
          notificationDate.getFullYear() === now.getFullYear()
        );
      },
    },
    older: {
      label: "Older",
      filter: (notification) => {
        const now = new Date();
        const notificationDate = new Date(notification.timestamp);
        return notificationDate < new Date(now.setDate(now.getDate() - 30));
      },
    },
  };

  useEffect(() => {
    // Load notifications from localStorage on initial render
    const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotificationsState(storedNotifications);

    // Fetch fresh notifications from API
    fetchNotifications(storedNotifications);
  }, []);

  const fetchNotifications = async (storedNotifications) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user_info"));
      const userId = userInfo?.userId;
      if (!userId) throw new Error("User ID not found.");

      const response = await fetch(`https://localhost:44328/api/NewNotification/${userId}/staged?showUnread=false`);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Only update state if new data is different
      if (JSON.stringify(storedNotifications) !== JSON.stringify(data)) {
        localStorage.setItem("notifications", JSON.stringify(data));
        setNotificationsState(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      console.error("Notification ID is undefined or null");
      return;
    }

    try {
      console.log(`🔄 Marking notification ${notificationId} as read...`);

      const response = await fetch(
        `https://localhost:44328/api/NewNotification/markAsRead/${notificationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read. Status: ${response.status}`);
      }

      console.log(`✅ Notification ${notificationId} successfully marked as read.`);

      // Update state & localStorage immediately
      setNotificationsState((prevState) => {
        const updatedNotifications = prevState.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, readStatus: true }
            : notification
        );

        localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
      
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  const filteredNotifications = notificationsState
    .filter((notification) => {
      const matchesSearch = notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'unread' ? !notification.readStatus : notification.readStatus;
      const matchesFilter = filterOptions[filterOption].filter(notification); // Apply the selected filter
      return matchesSearch && matchesTab && matchesFilter;
    })
    .sort((a, b) => {
      return sortOrder === 'newest'
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp);
    });

  return (
    <div className={styles.maiNContent}>
      <div className={`${styles.contners} mt-4`}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <FaBell className={`${styles.notificationIcons} me-2 text-success`} />
            <h2>Notifications</h2>
          </div>

          {/* Search Bar */}
          <div className={styles.searchBarContainers}>
            <input
              type="text"
              className={`${styles.formmControl} ${styles.searchInputs}`}
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className={styles.searchIcons} />
          </div>
        </div>

           {/* Explanation Message */}
           <div className={`${styles.infoMessage} alert alert-info`}>
          <FaInfoCircle className="me-2" />
          <strong>How it works:</strong> The **Unread** tab shows notifications you haven't read yet. Click **"Mark as Read"** to move them to the **Read** tab.
        </div>
        
        {/* Filter & Sort Controls */}
        <div className="d-flex justify-content-between mb-3">
          <select
            className="form-select w-25"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Filter Button */}
          <select
            className="form-select w-25"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            {Object.keys(filterOptions).map((key) => (
              <option key={key} value={key}>
                {filterOptions[key].label}
              </option>
            ))}
          </select>
        </div>

     
        {/* Tabs */}
        <ul className={`nav ${styles.navTabs} mb-3`}>
          <li className={styles.navItem}>
            <button
              className={`${styles.navLink} ${activeTab === 'unread' ? styles.active : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread Notifications
            </button>
          </li>
          <li className={styles.navItem}>
            <button
              className={`${styles.navLink} ${activeTab === 'read' ? styles.active : ''}`}
              onClick={() => setActiveTab('read')}
            >
              Read Notifications
            </button>
          </li>
        </ul>
        
        {/* Notifications Table */}
        <table className="table table-borderless">
          <tbody>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <tr key={notification.notificationId} className={styles.notificationRows}>
                  <td className="d-flex align-items-center">
                    <FaBell className={`${styles.notificationIcons} me-2`} />
                    <div>
                      <p>{notification.message}</p>
                      {/* Show "Mark as Read" button only for unread messages */}
                      {!notification.readStatus && (
                        <button 
                          className={`${styles.markAsReadButton}`} 
                          onClick={() => markAsRead(notification.notificationId)}
                          title="Click to mark as read"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <small className={styles.notificationTimestamps}>
                      {new Date(notification.timestamp).toLocaleString()}
                    </small>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className={styles.textCenter}>
                  <p>
                    {activeTab === 'unread'
                      ? 'No unread notifications available.'
                      : 'No read notifications available.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationContainer;
