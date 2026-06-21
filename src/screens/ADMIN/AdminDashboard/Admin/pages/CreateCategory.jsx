import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../SidebarCSS/CreateDepartment.module.css";

const CreateCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    // Trim whitespace from inputs
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    // Validation: Required fields
    if (!trimmedName) {
      alert("Please fill in all required fields.");
      return false;
    }

    // Validation: Category Name
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      alert("Category name must be between 3 and 50 characters.");
      return false;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmedName)) {
      alert("Category name can only contain letters, numbers, and spaces.");
      return false;
    }

    // Validation: Description (optional but limited to 500 characters)
    if (trimmedDescription && trimmedDescription.length > 500) {
      alert("Description cannot exceed 500 characters.");
      return false;
    }

    // Check for duplicate Category names (case insensitive)
    const existingCategories = JSON.parse(localStorage.getItem("categories")) || [];
    const isDuplicate = existingCategories.some(
      (dept) => dept.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      alert("A category with this name already exists!");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) return;

    // Add the new Category
    const newCategory = { name, description };
    const existingCategories = JSON.parse(localStorage.getItem("categories")) || [];
    const updatedCategories = [...existingCategories, newCategory];

    // Save updated categories to local storage
    localStorage.setItem("categories", JSON.stringify(updatedCategories));

    // Clear input fields
    setName("");
    setDescription("");

    // Show success message and navigate to "Manage Categories" page
    alert("Category created successfully!");
    navigate("/admindashboard/manageCategories");
  };

  return (
    <div className={styles.container}>
      <h1>Add Category</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Category Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description (optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Add
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
