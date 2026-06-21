import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../SidebarCSS/AssignTechnician.module.css";
import logo from "../adminIcons/account_circle.png";
import tag from "../adminIcons/Tag.png";

const AssignTech = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedCheckbox, setSelectedCheckbox] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [assignedTechnicians, setAssignedTechnicians] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date-asc");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [selectedTechIndex, setSelectedTechIndex] = useState(null);
  const [technicianIssueCounts, setTechnicianIssueCounts] = useState({});

useEffect(() => {
  const fetchTechnicians = async () => {
    try {
      const response = await fetch("https://localhost:44328/api/Technician/GetAll");
      if (response.ok) {
        const data = await response.json();

        // Map roleName to role for UI compatibility
        const formatted = data.map((tech) => ({
          ...tech,
          role: tech.roleName
        }));

        setTechnicians(formatted);
      } else {
        console.error("Failed to fetch technicians.");
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  };

    const fetchIssues = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/AdminLog/GetLogs");
        if (response.ok) {
          const data = await response.json();
          const sortedIssues = data.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
          setIssues(sortedIssues);
          setFilteredIssues(sortedIssues);

          const assigned = sortedIssues
            .filter((issue) => issue.technicianAssigned)
            .map((issue) => issue.logId);

          setAssignedIssues(assigned);

          const persistedAssignments = JSON.parse(localStorage.getItem("assignedTechnicians")) || {};
          setAssignedTechnicians(persistedAssignments);

          // Calculate initial assigned issue counts
          const initialCounts = {};
          sortedIssues.forEach(issue => {
            if (issue.technicianId) {
              initialCounts[issue.technicianId] = (initialCounts[issue.technicianId] || 0) + 1;
            }
          });
          setTechnicianIssueCounts(initialCounts);

        } else {
          console.error("Failed to fetch issues.");
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    fetchTechnicians();
    fetchIssues();
  }, []);

  const handleAssignClick = async () => {
    if (selectedCheckbox !== null && selectedIssueId !== null) {
      const assignedTech = technicians[selectedCheckbox];
      const payload = {
        logId: parseInt(selectedIssueId, 10),
        technicianId: assignedTech.userId,
      };

      try {
        const response = await fetch("https://localhost:44328/api/Log/AssignTechnician", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();
        if (response.ok) {
          toast.success(`You have assigned ${assignedTech.name} to the task!`);
          setShowModal(false);
          setShowTechDetails(false);
          setSelectedTechIndex(null);
          setAssignedIssues((prev) => [...prev, selectedIssueId]);

          setAssignedTechnicians((prevAssignments) => {
            const newAssignments = { ...prevAssignments, [selectedIssueId]: assignedTech.name };
            localStorage.setItem("assignedTechnicians", JSON.stringify(newAssignments));
            return newAssignments;
          });

          setIssues((prevIssues) =>
            prevIssues.map((issue) =>
              issue.logId === parseInt(selectedIssueId, 10)
                ? { ...issue, assignedTo: assignedTech.name, technicianId: assignedTech.userId }
                : issue
            )
          );

          setFilteredIssues((prevFilteredIssues) =>
            prevFilteredIssues.map((issue) =>
              issue.logId === parseInt(selectedIssueId, 10)
                ? { ...issue, assignedTo: assignedTech.name, technicianId: assignedTech.userId }
                : issue
            )
          );

          // Update technician issue counts
          setTechnicianIssueCounts(prevCounts => ({
            ...prevCounts,
            [assignedTech.userId]: (prevCounts[assignedTech.userId] || 0) + 1,
          }));

        } else {
          if (responseData.message?.includes("technician has already been assigned")) {
            toast.error("Technician already assigned to this task.");
          } else {
            toast.error(responseData.title || "Failed to assign technician.");
          }
        }
      } catch (error) {
        console.error("Error assigning technician:", error);
        toast.error("An error occurred while assigning the technician.");
      }
    } else {
      toast.error("Please select a technician and a log to assign.");
    }
  };

  const handleChevronClick = (index) => {
    if (selectedTechIndex === index && showTechDetails) {
      // Click on the same chevron when details are open: close it
      setShowTechDetails(false);
      setSelectedTechIndex(null);
    } else {
      // Click on a different chevron or the same one when closed: open it
      setSelectedTech(technicians[index]);
      setShowTechDetails(true);
      setSelectedTechIndex(index);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterIssues(query, sortOption, priorityFilter);
  };

  const handleSortChange = (event) => {
    const option = event.target.value;
    setSortOption(option);
    filterIssues(searchQuery, option, priorityFilter);
  };

  const handlePriorityFilterChange = (event) => {
    const priority = event.target.value;
    setPriorityFilter(priority);
    filterIssues(searchQuery, sortOption, priority);
  };

  const filterIssues = (query, sortOption, priority) => {
    let filtered = [...issues];

    if (priority !== "All") {
      filtered = filtered.filter((issue) => issue.priority === priority);
    }

    if (query) {
      filtered = filtered.filter((issue) =>
        issue.issueTitle.toLowerCase().includes(query) ||
        issue.logId.toString().toLowerCase().includes(query) ||
        issue.department.toLowerCase().includes(query) ||
        issue.priority.toLowerCase().includes(query)
      );
    }

    if (sortOption === "date-asc") {
      filtered.sort((a, b) => new Date(a.issuedAt) - new Date(b.issuedAt));
    } else if (sortOption === "date-desc") {
      filtered.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
    } else if (sortOption === "priority") {
      filtered.sort((a, b) => a.priority.localeCompare(b.priority));
    }

    setFilteredIssues(filtered);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowTechDetails(false);
    setSelectedTechIndex(null);
    setSelectedCheckbox(null);
  };

  return (
    <div className={styles.mainContainer}>
      <h2 className={styles.heading}>
        <img src={tag} alt="Tag" className={styles.tag} />
        ASSIGN TECHNICIAN
      </h2>

      <div className={styles.tableControls}>
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.dropdownGroup}>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className={styles.sortSelect}
          >
            <option value="date-asc">Sort by Date - Ascending</option>
            <option value="date-desc">Sort by Date - Descending</option>
            <option value="priority">Sort by Priority</option>
          </select>
          <select
            value={priorityFilter}
            onChange={handlePriorityFilterChange}
            className={styles.filterSelect}
          >
            <option value="All">All Priority Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <table className={`${styles.table} table table-striped`}>
        <thead>
          <tr>
            <th>Log ID</th>
            <th>Issue Title</th>
            <th>Log By</th>
            <th>Date Issued</th>
            <th>Department</th>
            <th>Assigned To</th>
            <th>Priority Level</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.map((issue) => (
            <tr key={issue.logId}>
              <td>{issue.issueId}</td>
              <td>{issue.issueTitle}</td>
              <td>{issue.logBy}</td>
              <td>
                {new Date(issue.issuedAt).toLocaleDateString()}{" "}
                {new Date(issue.issuedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>{issue.department}</td>
              <td>{issue.assignedTo || "Not Assigned"}</td>
              <td>{issue.priority}</td>
              <td>
                <button
                  className={`${styles.btnAssign} ${
                    assignedIssues.includes(issue.logId)
                      ? styles.btnDisabled
                      : ""
                  }`}
                  onClick={() => {
                    if (!assignedIssues.includes(issue.logId)) {
                      setShowModal(true);
                      setSelectedIssueId(issue.logId);
                    }
                  }}
                  disabled={assignedIssues.includes(issue.logId)}
                >
                  {assignedIssues.includes(issue.logId) ? "Assigned" : "Assign"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>SELECT TECHNICIAN</h3>
            {technicians.map((tech, index) => (
              <div
                key={tech.userId}
                className={styles.technicianContainer}
              >
                <input
                  type="checkbox"
                  className={styles.technicianCheckbox}
                  checked={selectedCheckbox === index}
                  onChange={() => setSelectedCheckbox(index)}
                />
                <img src={logo} alt="User Icon" className={styles.userIcon} />
                <div className={styles.technicianInfo}>
                  <p>{tech.name}</p>
                  <p>{tech.role === "External Technician" ? "External Technician" : "Technician"}</p>
                </div>
                <div
                  className={styles.chevronRight}
                  onClick={() => handleChevronClick(index)}
                >
                  &#8250;
                </div>
                {showTechDetails && selectedTechIndex === index && (
                  <div className={styles.techDetailsDropdown}>
                    <p>Role: {technicians[index].role}</p>
                    <p>Email: {technicians[index].email}</p>
                    <p>Time: {technicians[index].time}</p>
                  </div>
                )}
              </div>
            ))}

            <div className={styles.buttonContainer}>
              <button
                className={styles.btnClose}
                onClick={closeModal}
              >
                CLOSE
              </button>
              <button className={styles.btnAssign} onClick={handleAssignClick}>
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AssignTech;