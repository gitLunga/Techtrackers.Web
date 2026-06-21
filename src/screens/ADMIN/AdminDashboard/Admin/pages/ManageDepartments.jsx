import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "../SidebarCSS/ManageDepartments.module.css";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDepartmentHead, setEditDepartmentHead] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track visible dropdown
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const storedDepartments = JSON.parse(localStorage.getItem("departments")) || [];
    setDepartments(storedDepartments);
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
    const updatedDepartments = departments.filter((_, i) => i !== deleteIndex);
    localStorage.setItem("departments", JSON.stringify(updatedDepartments));
    setDepartments(updatedDepartments);
    setIsConfirmDeleteOpen(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setDeleteIndex(null);
  };

  const handleOpenPopup = (index) => {
    setEditIndex(index);
    setEditName(departments[index].name);
    setEditDescription(departments[index].description);
    setEditDepartmentHead(departments[index].departmentHead || "");
    setEditLocation(departments[index].location || "");
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditIndex(null);
    setEditName("");
    setEditDescription("");
    setEditDepartmentHead("");
    setEditLocation("");
  };

  const handleUpdate = () => {
    const updatedDepartments = [...departments];
    updatedDepartments[editIndex] = {
      name: editName,
      description: editDescription,
      departmentHead: editDepartmentHead,
      location: editLocation,
    };
    localStorage.setItem("departments", JSON.stringify(updatedDepartments));
    setDepartments(updatedDepartments);
    handleClosePopup();
    alert("Department updated successfully!");
  };

  return (
    <div className={styles.container} onClick={closeDropdown}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Manage Departments</h1>
      {departments.length === 0 ? (
        <p>No departments created yet.</p>
      ) : (
        <div className={styles.departmentList}>
          {departments.map((department, index) => (
            <div key={index} className={styles.departmentBox}>
              <div className={styles.departmentName}>{department.name}</div>

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
            <h2>Update Department</h2>
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
            <label>
              Department Head:
              <input
                type="text"
                value={editDepartmentHead}
                onChange={(e) => setEditDepartmentHead(e.target.value)}
                className={styles.input}
              />
            </label>
            <label>
              Location:
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className={styles.input}
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
            <h2>Are you sure you want to delete this department?</h2>
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

export default ManageDepartments;
