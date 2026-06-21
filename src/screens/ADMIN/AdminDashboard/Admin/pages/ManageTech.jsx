import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../SidebarCSS/Table.module.css";
import TechnicianDetailView from "./TechnicianDetailView";
import VectorIcon from "../adminIcons/Vector.png";
import axios from "axios";

const ManageTechniciansHeader = () => {
  const navigate = useNavigate();

  const handleAddTechnicianClick = () => {
    navigate("/admindashboard/add-tech"); // Navigate to Add Technician page
  };

  return (
    <div className={styles.headerContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={VectorIcon} className={styles.manageicons} alt="Technicians Icon" />
          <div className={styles.headerText}>
            <h2>Manage Technicians</h2>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.addTechnicianButton}
            onClick={handleAddTechnicianClick}
          >
            ADD TECHNICIAN
          </button>
        </div>
      </header>
    </div>
  );
};

const ManageTechniciansTable = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await axios.get(
          "https://localhost:44328/api/TechnicianHandler/GetTechnicians"
        );
        const technicianData = response.data.map((technician) => ({
          ...technician,
          name: `${technician.surname} ${technician.initials}`, // Combine name
        }));

        setTechnicians(technicianData);
      } catch (error) {
        console.error("Error fetching technicians:", error.message);
        alert("Failed to fetch technicians. Please check the backend.");
      }
    };

    fetchTechnicians();
  }, []);

  const handleViewClick = (technician) => {
    setSelectedTechnician(technician);
  };

  const handleRemoveTechnician = async (technicianId) => {
    try {
      const response = await axios.delete(
        `http://localhost:44328/api/TechnicianHandler/DeleteTechnician/${technicianId}`
      );
      setTechnicians((prevTechs) =>
        prevTechs.filter((tech) => tech.technicianId !== technicianId)
      );
      alert(response.data.message || `Technician ${technicianId} removed.`);
    } catch (error) {
      console.error("Error deleting technician:", error.message);
      alert("Failed to remove technician. Please try again.");
    }
  };

  const handleBackToList = () => {
    navigate("/admindashboard/dashboard");
  };

  if (selectedTechnician) {
    return (
      <TechnicianDetailView
        technician={selectedTechnician}
        onBack={() => setSelectedTechnician(null)}
        onRemove={handleRemoveTechnician}
      />
    );
  }

  const getTechnicianType = (technician) => {
     // Default to Internal if technicianType is null/undefined
  return technician.technicianType === 'external' ? 'External' : 'Internal';
    /*// External technicians will have location/serviceType fields
    if (technician.location || technician.serviceType) {
      return 'External';
    }
    // Internal technicians will have specialization
    return 'Internal';*/
  };

  return (
    <div className={styles.tableContainer}>
      <ManageTechniciansHeader />
      <table className={styles.issueTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Type</th>
            <th>Contact</th>
            <th>Availability</th>
            <th>No. Issues</th>
            <th>Active Issues</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {technicians.map((technician) => (
            <tr key={technician.technicianId}>
              <td>{technician.name}</td>
              <td>{technician.emailAddress || "N/A"}</td>
              <td>{technician.specialization || "N/A"}</td>
              <td>{getTechnicianType(technician)}</td>
              <td>{technician.contacts || "N/A"}</td>
              <td>{`${technician.fromTime || "N/A"} - ${technician.toTime || "N/A"}`}</td>
              <td>{technician.noOfTask || 0}</td>
              <td>{technician.activeTasks || 0}</td>
              <td>
                <button
                  className={styles.viewButton}
                  onClick={() => handleViewClick(technician)}
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleBackToList} className={styles.backButton}>
        Back
      </button>
    </div>
  );
};

export default ManageTechniciansTable;
