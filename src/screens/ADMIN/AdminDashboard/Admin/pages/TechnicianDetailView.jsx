import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../SidebarCSS/DetailView.module.css';

const TechnicianDetailView = ({ technician, onBack, onRemove }) => {
  const [formData, setFormData] = useState(technician);
  const [technicianType, setTechnicianType] = useState(technician.technicianType || 'external'); // Track selected type
  const [isVisible, setIsVisible] = useState(true);
  const [isRemoved, setIsRemoved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle technician type change
  const handleTechTypeChange = (e) => {
    const newType = e.target.value;
    setTechnicianType(newType);

    // Reset fields based on the selected type
    setFormData((prevData) => ({
      ...prevData,
      name: newType === 'external' ? '' : prevData.name, // Clear for Company Name
      specialization: newType === 'internal' ? prevData.specialization : '', // Hide for external
      location: newType === 'external' ? '' : prevData.location, // Show only for external
      serviceType: newType === 'external' ? '' : prevData.serviceType, // Show only for external
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setModalType('update');
    setShowModal(true);
  };

  const confirmUpdate = () => {
    console.log('Updated Technician Info:', formData);
    toast.success('Technician information updated successfully!');

    setTimeout(() => {
      setShowModal(false);
      onBack();
    }, 2000);
  };

  const handleRemove = () => {
    setModalType('remove');
    setShowModal(true);
  };

  const confirmRemove = () => {
    console.log(`Technician ${technician.technicianId} removed`);
    toast.success('Technician removed successfully!');

    onRemove(technician.technicianId);

    setTimeout(() => {
      setIsRemoved(true);
      setIsVisible(false);
      setShowModal(false);
      onBack();
    }, 2000);
  };

  const cancelAction = () => setShowModal(false);

  if (isRemoved) {
    return <div className={styles.removedMessage}>Technician has been successfully removed.</div>;
  }

  if (!isVisible) return null;

  return (
    <div className={styles.detailContainer}>
      <h2>Edit Technician Information</h2>
      <form onSubmit={handleSubmit} className={styles.detailForm}>
        <div className={styles.leftColumn}>
          <div className={styles.formGroup}>
            <label>Technician Type:</label>
            <div className={styles.radioBtns}>
              <input
                type="radio"
                id="internal"
                name="techType"
                value="internal"
                checked={technicianType === 'internal'}
                onChange={handleTechTypeChange}
                disabled
              />
              <label htmlFor="internal">Internal</label>

              <input
                type="radio"
                id="external"
                name="techType"
                value="external"
                checked={technicianType === 'external'}
                onChange={handleTechTypeChange}
                disabled
              />
              <label htmlFor="external">External</label>
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className={styles.formGroup}>
            <label htmlFor="name">
              {technicianType === 'external' ? 'Company Name:' : 'Name:'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              required
            />
          </div>

          {/* Show Specialization only for Internal, Show Location + Service Type for External */}
          {technicianType === 'internal' && (
            <div className={styles.formGroup}>
              <label htmlFor="specialization">Specialization:</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {technicianType === 'external' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="serviceType">Service Type:</label>
                <input
                  type="text"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formGroup}>
            <label htmlFor="contact">Contact:</label>
            <input
              type="text"
              name="contacts"
              value={formData.contacts}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fromTime">From Time:</label>
            <input
              type="time"
              name="fromTime"
              value={formData.fromTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="toTime">To Time:</label>
            <input
              type="time"
              name="toTime"
              value={formData.toTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.buttonsContainer}>
          <button type="submit" className={styles.submitButton}>Update Technician</button>
          <button type="button" onClick={handleRemove} className={styles.removeButton}>Remove Technician</button>
          <button type="button" onClick={onBack} className={styles.backButton}>Back</button>
        </div>
      </form>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <p>
              {modalType === 'update'
                ? 'Are you sure you want to update this technician information?'
                : 'Are you sure you want to remove this technician?'}
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={modalType === 'update' ? confirmUpdate : confirmRemove}
                className={styles.confirmButton}
              >
                Yes
              </button>
              <button onClick={cancelAction} className={styles.cancelButton}>No</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

TechnicianDetailView.propTypes = {
  technician: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default TechnicianDetailView;
