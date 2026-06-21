import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faPlus, faNetworkWired, faListUl } from "@fortawesome/free-solid-svg-icons";
import styles from "../SidebarCSS/DashboardPage.module.css";


const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("departments");

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Navigate to the "Create Department" page
  const handleCreateDepartmentClick = () => {
    navigate("/admindashboard/CreateDepartment");
  };

  // Navigate to the "Manage Departments" page
  const handleManageDepartmentsClick = () => {
    navigate("/admindashboard/ManageDepartments");
  };

  // Navigate to the "Create Department" page
  const handleCreateCategoryClick = () => {
    navigate("/admindashboard/createCategory");
  };

  // Navigate to the "Manage Departments" page
  const handleManageCategoriesClick = () => {
    navigate("/admindashboard/manageCategories");
  };
    // Navigate to the "Create Department" page
    const handleCreateUserRolesClick = () => {
      navigate("/admindashboard/createUserRole");
    };
  
    // Navigate to the "Manage Departments" page
    const handleManageUserRolesClick = () => {
      navigate("/admindashboard/manageUserRoles");
    };
  
  return (
    <div className={styles.dashboardContainer}>

      {/* Tabs Section */}
      <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === "departments" ? styles.active : ""}`}
        onClick={() => handleTabClick("departments")}
      >
        DEPARTMENTS
      </button>

        <button
          className={`${styles.tab} ${activeTab === "categories" ? styles.active : ""}`}
          onClick={() => handleTabClick("categories")}
        >
          CATEGORIES
        </button>
        <button
          className={`${styles.tab} ${activeTab === "user roles" ? styles.active : ""}`}
          onClick={() => handleTabClick("user roles")}
        >
          USER-ROLES
        </button>
      </div>

      {/* Department case details */}
      {activeTab ==="departments" && (
        <div className={styles.caseDetails}>

          {/* <h1 className={styles.welcomeMessage}>DEPARTMENTS</h1> */}

          {/* Create Department Section */}
          <div
            className={styles.dashboardCard}
            onClick={handleCreateDepartmentClick}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cardIcon}>
              <FontAwesomeIcon icon={faPlus} className={styles.icon} />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Create Department</h2>
              <p className={styles.cardDescription}>
                Add a new department to the system.
              </p>
            </div>
          </div>

          {/* Manage Departments Section */}
          <div
            className={styles.dashboardCard}
            onClick={handleManageDepartmentsClick}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cardIcon}>
              <FontAwesomeIcon icon={faNetworkWired} className={styles.icon} />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Manage Departments</h2>
              <p className={styles.cardDescription}>
                View and manage all departments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories case details */}
      {activeTab ==="categories" && (
        <div className={styles.caseDetails}>

          {/* <h1 className={styles.welcomeMessage}>CATEGORIES</h1> */}

          {/* Create Category Section */}
          <div
            className={styles.dashboardCard}
            onClick={handleCreateCategoryClick}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cardIcon}>
              <FontAwesomeIcon icon={faPlus} className={styles.icon} />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Create Issue Category</h2>
              <p className={styles.cardDescription}>
                Add a new category to the system.
              </p>
            </div>
          </div>

          {/* Manage Departments Section */}
          <div
            className={styles.dashboardCard}
            onClick={handleManageCategoriesClick}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cardIcon}>
              <FontAwesomeIcon icon={faListUl} className={styles.icon} />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Manage Issue Categories</h2>
              <p className={styles.cardDescription}>
                View and manage all categories.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Department case details */}
      {activeTab ==="user roles" && (
        <div className={styles.caseDetails}>

          {/* <h1 className={styles.welcomeMessage}>USER-ROLES</h1> */}

          {/* Create Department Section */}
          <div
            className={styles.dashboardCard}
            onClick={handleCreateUserRolesClick}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cardIcon}>
              <FontAwesomeIcon icon={faPlus} className={styles.icon} />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Create User Role</h2>
              <p className={styles.cardDescription}>
                Add a new role to the system.
              </p>
            </div>
          </div>

          {/* Manage Departments Section */}
          <div
            className={styles.dashboardCard}
            onClick={handleManageUserRolesClick}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cardIcon}>
              <FontAwesomeIcon icon={faUsers} className={styles.icon} />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Manage User-Roles</h2>
              <p className={styles.cardDescription}>
                View and manage all User-Roles.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
