import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "../SidebarCSS/ManageCategories.module.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track visible dropdown
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const storedCategories = JSON.parse(localStorage.getItem("categories")) || [];
    setCategories(storedCategories);
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
    const updatedCategories= categories.filter((_, i) => i !== deleteIndex);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    setIsConfirmDeleteOpen(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setDeleteIndex(null);
  };

  const handleOpenPopup = (index) => {
    setEditIndex(index);
    setEditName(categories[index].name);
    setEditDescription(categories[index].description);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditIndex(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = () => {
    const updatedCategories = [...categories];
    updatedCategories[editIndex] = {
      name: editName,
      description: editDescription
    };
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    handleClosePopup();
    alert("Categories updated successfully!");
  };

  return (
    <div className={styles.container} onClick={closeDropdown}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Manage Categories</h1>
      {categories.length === 0 ? (
        <p>No categories created yet.</p>
      ) : (
        <div className={styles.categoryList}>
          {categories.map((category, index) => (
            <div key={index} className={styles.categoryBox}>
              <div className={styles.categoryName}>{category.name}</div>

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
            <h2>Update Category</h2>
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
            <h2>Are you sure you want to delete this category?</h2>
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

export default ManageCategories;
