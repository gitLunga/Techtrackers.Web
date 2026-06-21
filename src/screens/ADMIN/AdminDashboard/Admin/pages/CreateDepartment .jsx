import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../SidebarCSS/CreateDepartment.module.css";

const CreateDepartment = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentHead, setDepartmentHead] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    // Trim whitespace from inputs
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedDepartmentHead = departmentHead.trim();
    const trimmedLocation = location.trim();

    // Validation: Required fields
    if (!trimmedName || !trimmedDepartmentHead || !trimmedLocation) {
      alert("Please fill in all required fields.");
      return false;
    }

    // Validation: Department Name
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      alert("Department name must be between 3 and 50 characters.");
      return false;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmedName)) {
      alert("Department name can only contain letters, numbers, and spaces.");
      return false;
    }

    // Validation: Description (optional but limited to 500 characters)
    if (trimmedDescription && trimmedDescription.length > 500) {
      alert("Description cannot exceed 500 characters.");
      return false;
    }

    // Validation: Department Head
    if (trimmedDepartmentHead.length < 3 || trimmedDepartmentHead.length > 50) {
      alert("Department head name must be between 3 and 50 characters.");
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedDepartmentHead)) {
      alert("Department head name can only contain letters and spaces.");
      return false;
    }

    // Validation: Location
    if (trimmedLocation.length < 3 || trimmedLocation.length > 50) {
      alert("Location must be between 3 and 50 characters.");
      return false;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmedLocation)) {
      alert("Location can only contain letters, numbers, and spaces.");
      return false;
    }

    // Check for duplicate department names (case insensitive)
    const existingDepartments = JSON.parse(localStorage.getItem("departments")) || [];
    const isDuplicate = existingDepartments.some(
      (dept) => dept.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      alert("A department with this name already exists!");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) return;

    // Add the new department
    const newDepartment = { name, description, departmentHead, location };
    const existingDepartments = JSON.parse(localStorage.getItem("departments")) || [];
    const updatedDepartments = [...existingDepartments, newDepartment];

    // Save updated departments to local storage
    localStorage.setItem("departments", JSON.stringify(updatedDepartments));

    // Clear input fields
    setName("");
    setDescription("");
    setDepartmentHead("");
    setLocation("");

    // Show success message and navigate to "Manage Departments" page
    alert("Department created successfully!");
    navigate("/admindashboard/ManageDepartments");
  };

  return (
    <div className={styles.container}>
      <h1>Create Department</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Department Name:</label>
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

        <div className={styles.formGroup}>
          <label htmlFor="departmentHead">Department Head:</label>
          <input
            type="text"
            id="departmentHead"
            value={departmentHead}
            onChange={(e) => setDepartmentHead(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Create
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

export default CreateDepartment;
