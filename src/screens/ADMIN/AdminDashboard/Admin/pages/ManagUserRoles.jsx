import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "../SidebarCSS/ManageUserRoles.module.css";

const ManageUserRoles = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track visible dropdown
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const storedUserRoles = JSON.parse(localStorage.getItem("userRoles")) || [];
    setUserRoles(storedUserRoles);
  }, []);

  const toggleDropdown = (index) => {
    setDropdownVisible(dropdownVisible === index ? null : index); // Toggle dropdown
  };

  const closeDropdown = () => {
    setDropdownVisible(null); // Close dropdown
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    const updatedUserRoles = userRoles.filter((_, i) => i !== deleteIndex);
    localStorage.setItem("userRoles", JSON.stringify(updatedUserRoles));
    setUserRoles(updatedUserRoles);
    setIsConfirmDeleteOpen(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setDeleteIndex(null);
  };

  const handleOpenPopup = (index) => {
    setEditIndex(index);
    setEditName(userRoles[index].name);
    setEditDescription(userRoles[index].description);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditIndex(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = () => {
    const updatedUserRoles = [...userRoles];
    updatedUserRoles[editIndex] = {
      name: editName,
      description: editDescription,
    };
    localStorage.setItem("userRoles", JSON.stringify(updatedUserRoles));
    setUserRoles(updatedUserRoles);
    handleClosePopup();
    alert("User-Role updated successfully!");
  };

  return (
    <div className={styles.container} onClick={closeDropdown}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Manage User-Roles</h1>
      {userRoles.length === 0 ? (
        <p>No User-Roles created yet.</p>
      ) : (
        <div className={styles.userRoleList}>
          {userRoles.map((userRole, index) => (
            <div key={index} className={styles.userRoleBox}>
              <div className={styles.userRoleName}>{userRole.name}</div>

              {/* Dropdown */}
              <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.dropdownButton}
                  onClick={() => toggleDropdown(index)}
                >
                  ⋮
                </button>
                {dropdownVisible === index && (
                  <ul className={styles.dropdownMenu}>
                    <li onClick={() => handleOpenPopup(index)}>Edit</li>
                    <li onClick={() => handleDelete(index)}>Delete</li>
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup for editing */}
      {isPopupOpen && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h2>Update User-Role</h2>
            <label>
              Name:
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={styles.input}
              />
            </label>
            <label>
              Description:
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={styles.textarea}
              />
            </label>
            <div className={styles.popupButtons}>
              <button onClick={handleUpdate} className={styles.saveButton}>
                Save
              </button>
              <button onClick={handleClosePopup} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation popup */}
      {isConfirmDeleteOpen && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h2>Are you sure you want to delete this UserRole?</h2>
            <div className={styles.popupButtons}>
              <button onClick={confirmDelete} className={styles.saveButton}>
                Yes
              </button>
              <button onClick={cancelDelete} className={styles.cancelButton}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUserRoles;
