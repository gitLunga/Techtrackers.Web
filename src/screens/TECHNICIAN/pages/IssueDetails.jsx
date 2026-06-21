"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import styles from "../SidebarCSS/IssueDetails.module.css"
import desc from "../images/desc.png"
import attachme from "../images/attachme.png"
import chat from "../images/chat.png"
import profile from "../images/profileAllIssue.png"
import tickIcon from "../images/tickIcon.png"
import CollabArrow from "../images/CollabArrow.png"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

const IssueDetails = ({ issues }) => {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const [technicians, setTechnicians] = useState([])
  const [selectedTech, setSelectedTech] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [note, setNote] = useState("")
  const [isMaterialPopupVisible, setIsMaterialPopupVisible] = useState(false)
  const [materials, setMaterialsInput] = useState("")
  const [materialsList, setMaterialsList] = useState([])
  const MATERIALS_STORAGE_KEY = `materials_${issueId}`
  const [materialInputs, setMaterialInputs] = useState([{ name: "", description: "", quantity: 0, isEditing: true }])
  const [isAddingNewMaterial, setIsAddingNewMaterial] = useState(false)
  const [editMaterialIndex, setEditMaterialIndex] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editMaterial, setEditMaterial] = useState({ name: "", description: "", quantity: "" })
  const [viewMode, setViewMode] = useState("list")

  const issueIndex = issues?.findIndex((i) => i.issueId === issueId)
  const issue = issues?.[issueIndex]

  console.log("Issue Id:", issue)

  const loggedInTechnician = JSON.parse(localStorage.getItem("user_info"))
  console.log("loggedInTechnician value & type:", loggedInTechnician, typeof loggedInTechnician)

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Add header
    doc.setFontSize(20)
    doc.setTextColor(39, 119, 119)
    doc.text("Materials List", 14, 20)

    // Add issue details
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Issue ID: ${issue?.issueId}`, 14, 35)
    doc.text(`Issue Title: ${issue?.issueTitle}`, 14, 45)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 55)

    const tableColumn = ["Name", "Description", "Quantity"]
    const tableRows = materialsList.map((mat) => [mat.name, mat.description, mat.quantity])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: "striped",
      headStyles: { fillColor: [39, 119, 119] },
    })

    doc.save(`materials_list_${issueId}.pdf`)
    toast.success("PDF exported successfully!")
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(materialsList)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Materials")
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    saveAs(data, `materials_list_${issueId}.xlsx`)
    toast.success("Excel file exported successfully!")
  }

  useEffect(() => {
    const savedMaterials = localStorage.getItem(MATERIALS_STORAGE_KEY)
    if (savedMaterials) {
      setMaterialInputs(JSON.parse(savedMaterials))
    }
  }, [issueId])

  useEffect(() => {
    localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materialInputs))
  }, [materialInputs])

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/Technician/GetAll")
        if (response.ok) {
          const data = await response.json()

          // Map roleName to role for UI compatibility
          const formatted = data.map((tech) => ({
            ...tech,
            role: tech.roleName,
          }))

          setTechnicians(formatted)
        } else {
          console.error("Failed to fetch technicians.")
        }
      } catch (error) {
        console.error("Error fetching technicians:", error)
      }
    }

    fetchTechnicians()
  }, [])

  useEffect(() => {
    if (issues && issues.length > 0) {
      localStorage.setItem("Tech Issues", JSON.stringify(issues))
    }
  }, [issues])

  if (!issue) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3>Issue Not Found</h3>
          <p>The requested issue could not be found.</p>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const handleInviteClick = () => {
    setShowModal(true)
  }

  const handleMaterialClick = () => {
    setMaterialsInput(issue.material || "")
    setIsMaterialPopupVisible(true)
  }

  const handleCloseMaterialPopup = () => {
    setIsMaterialPopupVisible(false)
    setMaterialsInput("")
  }

  const handleMaterialsInputChange = (event) => {
    setMaterialsInput(event.target.value)
  }

  const materialToEdit = materialsList[editMaterialIndex]

  const isAnyRowIncomplete = materialInputs.some((input) => !input.name || !input.description || !input.quantity)

  const addMaterialRow = () => {
    setMaterialInputs((prevInputs) => [...prevInputs, { name: "", description: "", quantity: "", isEditing: true }])
    setIsAddingNewMaterial(true)
  }

  const removeMaterialRow = (indexToRemove) => {
    setMaterialInputs((prevInputs) => prevInputs.filter((_, i) => i !== indexToRemove))
  }

  const toggleEditMaterialRow = (index) => {
    const updatedMaterials = [...materialInputs]
    updatedMaterials[index].isEditing = !updatedMaterials[index].isEditing
    setMaterialInputs(updatedMaterials)
  }

  const handleMaterialChange = (index, field, value) => {
    const newInputs = [...materialInputs]
    newInputs[index][field] = value
    setMaterialInputs(newInputs)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditMaterial((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    const updatedList = [...materialsList]
    updatedList[editingIndex] = editMaterial
    setMaterialsList(updatedList)
    setEditingIndex(null)
  }

  const handleSaveMaterials = () => {
    const completeMaterials = materialInputs.filter((mat) => mat.name && mat.description && mat.quantity)

    setMaterialsList((prevList) => [...prevList, ...completeMaterials])
    setMaterialInputs([{ name: "", description: "", quantity: "", isEditing: true }])
    setIsMaterialPopupVisible(false)
    setIsAddingNewMaterial(false)
    toast.success("Materials saved successfully!")
  }

  const handleUpdateStatus = async (status) => {
    if (issue.status === "RESOLVED") {
      toast.error("Cannot update status. The issue is already resolved.")
      return
    }

    if (issue.status === "ESCALATED") {
      toast.error("Cannot update status. This issue has been escalated and requires HOD attention.")
      return
    }

    try {
      if (!issueId || issueId.trim() === "") {
        toast.error("Invalid issue ID. Cannot update status.")
        return
      }

      if (status === "ONHOLD") {
        setShowUpdateModal(false)
        setShowAddNoteModal(true)
        return
      }

      const response = await fetch(`https://localhost:44328/api/ManageLogs/ChangeLogStatus/${issueId}/${status}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (response.ok && data.isSuccess) {
        issue.status = status
        toast.success(`Status updated to ${status}!`)
        setShowUpdateModal(false)
      } else {
        const errorMsg = data.message.includes("escalated")
          ? "Cannot update escalated issues - contact your HOD"
          : data.message || "Failed to update status."
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error("Request Error:", error)
      toast.error("An error occurred while updating the status.")
    }
  }

  const handleAddNoteClick = () => {
    setShowAddNoteModal(true)
  }

  const handleNoteSubmit = async () => {
    if (issue.status === "RESOLVED") {
      toast.error("Cannot update status. The issue is already RESOLVED.")
      return
    }

    if (!note.trim()) {
      toast.error("Please enter a note before submitting.")
      return
    }

    try {
      const response = await fetch(`https://localhost:44328/api/ManageLogs/ChangeLogStatus/${issue.issueId}/ONHOLD`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Note: note,
        }),
      })

      const data = await response.json()

      if (response.ok && data.isSuccess) {
        issue.status = "ONHOLD"
        issue.note = note
        toast.success("Status changed to ONHOLD with note.")
        setShowAddNoteModal(false)
        setShowUpdateModal(false)
      } else {
        toast.error(data.message || "Failed to update status.")
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("An error occurred while submitting the note.")
    }

    setNote("")
  }

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate("/techniciandashboard/tbl")
    }
  }

  const handleCollabArrowClick = async () => {
    if (!selectedTechnician) {
      toast.error("Please select a technician to invite.")
      return
    }

    const invitedTechnician = technicians.find((tech) => tech.surname === selectedTechnician)

    if (!invitedTechnician) {
      toast.error("Selected technician not found.")
      return
    }

    const requestDto = {
      LogId: issue.logId,
      RequestingTechnicianId: loggedInTechnician.userId,
      InvitedTechnicianId: invitedTechnician.userId,
    }

    try {
      const response = await fetch("https://localhost:44328/api/Collaboration/Request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDto),
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        setShowSuccess(true)
        toast.success(`Collaboration Invitation sent to ${selectedTechnician}`)
      } else {
        console.error("API Error:", data)
        toast.error(data.message || "Failed to send invitation.")
      }
    } catch (error) {
      console.error("Request Error:", error)
      toast.error("An error occurred while sending the invitation.")
    }
  }

  const handleChat = () => {
    navigate("/techniciandashboard/staffChat")
  }

  const filteredTechnicians = technicians.filter((tech) => tech.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCheckboxChange = (tech) => {
    setSelectedTechnician(selectedTechnician === tech.name ? null : tech.name)
    console.log("Selected Technician: ", technicians)
  }

  const handleUpdateClick = () => {
    setShowUpdateModal(true)
  }

  const handleEditMaterial = (index) => {
    const materialToEdit = materialsList[index]
    console.log("Editing material:", materialToEdit)
  }

  const handleAttachmentClick = () => {
    setShowAttachmentModal(true)
  }

  // Get priority styling
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return styles.priorityHigh
      case "medium":
        return styles.priorityMedium
      case "low":
        return styles.priorityLow
      default:
        return ""
    }
  }

  // Get status styling
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return styles.pending
      case "resolved":
        return styles.resolved
      case "inprogress":
        return styles.inprogress
      case "escalated":
        return styles.escalated
      case "onhold":
        return styles.onhold
      case "closed":
        return styles.closed
      default:
        return ""
    }
  }

  return (
    <div className={styles.issueDetailsContainer}>
      <div className={styles.issue}>
        <h2>Issue title: {issue.issueTitle}</h2>
        <a href="#">
          <img src={chat || "/placeholder.svg"} width="40" height="40" alt="Chat Icon" onClick={handleChat} />
        </a>
      </div>

      <div className={styles.issueHeader}>
        <div className={styles.issueRequestor}>
          <div className={styles.profile}>
            <h6 className={styles.name}>Issue ID: </h6>
            <p className={styles.name}>#{issue.issueId}</p>
          </div>
        </div>

        <div className={styles.issueInfo}>
          <div className={styles.prio1}>
            <p>
              Priority:{" "}
              <span className={`${styles.priorityText} ${getPriorityClass(issue.priority)}`}>
                {issue.priority?.toUpperCase()}
              </span>
            </p>
            <div className={styles.dateIssue}>
              <p className={styles.issueDate}>Date Created: {issue.issuedAt}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.issueDetails}>
        <h3>
          <img src={desc || "/placeholder.svg"} width="25" height="30" alt="Description Icon" /> Description
        </h3>
        <p className={styles.descriptionText}>{issue.description}</p>
      </div>

      {issue.attachmentBase64 && (
        <div className={styles.attachments}>
          <h3>
            <img src={attachme || "/placeholder.svg"} width="15" height="15" alt="Attachment Icon" />
            <h4>Attachments</h4>
          </h3>
          <div className={styles.attachment} onClick={handleAttachmentClick}>
            <img
              src={`data:image/jpeg;base64,${issue.attachmentBase64}`}
              alt="Uploaded Attachment"
              style={{ maxWidth: "200px", height: "auto", borderRadius: "8px", cursor: "pointer" }}
            />
            <p>Click to view full size</p>
          </div>
        </div>
      )}

      <div className={styles.additionalInfo}>
        <p>
          <strong>Department:</strong> {issue.department}
        </p>
        <p>
          <strong>Location:</strong> {issue.location}
        </p>
      </div>

      <div className={styles.statuses}>
        <h3>Status:</h3>
        <p>
          <span className={`${styles.statusText} ${getStatusClass(issue.status)}`}>{issue.status}</span>
        </p>
      </div>

      <div className={styles.actions1}>
        <button className={styles.inviteButton} onClick={handleInviteClick}>
          Invite Technician
        </button>
        <button className={styles.materialButton} onClick={handleMaterialClick}>
          Add Materials
        </button>

        {/* Enhanced Materials Modal */}
        {isMaterialPopupVisible && (
          <div className={styles.materialsModalOverlay}>
            <div className={styles.materialsModalContent}>
              <button className={styles.modalClose} onClick={() => setIsMaterialPopupVisible(false)}>
                &times;
              </button>
              <h3>Add Materials</h3>
              <textarea
                className={styles.materialsTextarea}
                value={materials}
                onChange={(e) => handleMaterialsInputChange(e.target.value)}
                placeholder="Enter each material on a new line"
                rows={6}
              />
              <div className={styles.materialsModalActions}>
                <button className={styles.cancelButton} onClick={() => setIsMaterialPopupVisible(false)}>
                  Cancel
                </button>
                <button className={styles.updateButton} onClick={handleSaveMaterials}>
                  Save Materials
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.rightActions}>
          <div className={styles.buttonContainer}>
            <button className={styles.updateButton} onClick={handleUpdateClick}>
              Update Status
            </button>
            <button className={styles.closeButton1} onClick={handleBack}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Materials Display */}
      {materialsList.length > 0 && (
        <div className={styles.materialsDisplay}>
          <div className={styles.materialsHeader}>
            <h3>Materials List:</h3>
            <div className={styles.downloadButtons}>
              <button onClick={exportToPDF} className={styles.downloadButton}>
                📄 Export PDF
              </button>
              <button onClick={exportToExcel} className={styles.downloadButton}>
                📊 Export Excel
              </button>
            </div>
          </div>
          <ul className={styles.materialsList}>
            {materialsList.map((material, index) => (
              <li key={index} className={styles.materialItem}>
                <span>{material.name}</span>
                <span>{material.description}</span>
                <span>{material.quantity}</span>
                <button className={styles.editMaterialButton} onClick={() => handleEditMaterial(index)}>
                  ✏️ Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Attachment Modal */}
      {showAttachmentModal && issue.attachmentBase64 && (
        <div className={styles.attachmentModalOverlay} onClick={() => setShowAttachmentModal(false)}>
          <div className={styles.attachmentModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.attachmentModalClose} onClick={() => setShowAttachmentModal(false)}>
              &times;
            </button>
            <div className={styles.attachmentModalHeader}>
              <h3>Attachment Preview</h3>
              <div className={styles.attachmentActions}>
                <button
                  className={styles.downloadAttachmentButton}
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = `data:image/jpeg;base64,${issue.attachmentBase64}`
                    link.download = `attachment_${issue.issueId}.jpg`
                    link.click()
                  }}
                >
                  📥 Download
                </button>
              </div>
            </div>
            <div className={styles.attachmentImageContainer}>
              <img
                src={`data:image/jpeg;base64,${issue.attachmentBase64}`}
                alt="Full Size Attachment"
                className={styles.attachmentFullImage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Collaboration Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setShowModal(false)}>
              &times;
            </button>
            <div className={styles.collabHeader}>
              <h5 style={{ margin: 0 }}>Collaborate with:</h5>
              <input
                type="text"
                placeholder="Search for a technician..."
                className={styles.searchBar}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.technicianList}>
              {filteredTechnicians
                .filter(
                  (tech) =>
                    tech.role === "Technician" &&
                    tech.name?.trim().toLowerCase() !== String(loggedInTechnician.name).trim().toLowerCase(),
                )
                .map((tech, index) => (
                  <div
                    key={index}
                    className={`${styles.technicianContainer} ${
                      selectedTechnician === tech.name ? styles.selected : ""
                    }`}
                  >
                    <div className={styles.technicianInfo}>
                      <input
                        type="checkbox"
                        className={styles.technicianCheckbox}
                        checked={selectedTechnician === tech.name}
                        onChange={() => handleCheckboxChange(tech)}
                      />
                      <img
                        src={profile || "/placeholder.svg"}
                        alt="User Icon"
                        className={styles.userIcon}
                        height={40}
                      />
                      <div className={styles.technicianDetails}>
                        <p>
                          <strong>{tech.name}</strong>
                        </p>
                        <p>Technician</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div
              className={styles.tickIconContainer}
              onClick={handleCollabArrowClick}
              style={{ cursor: "pointer", marginTop: "15px" }}
            >
              <img src={CollabArrow || "/placeholder.svg"} alt="Send Invitation" className={styles.tickIcon} />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Update Status Modal */}
      {showUpdateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent2}>
            <button className={styles.modalClose} onClick={() => setShowUpdateModal(false)}>
              &times;
            </button>
            <h4>Update Issue Status</h4>
            <div className={styles.statusButtons}>
              <button className={`${styles.statusButton} ${styles.onholdButton}`} onClick={() => handleAddNoteClick()}>
                ON HOLD
              </button>
              <button
                className={`${styles.statusButton} ${styles.inprogressButton}`}
                onClick={() => handleUpdateStatus("INPROGRESS")}
              >
                IN PROGRESS
              </button>
              <button
                className={`${styles.statusButton} ${styles.resolvedButton}`}
                onClick={() => handleUpdateStatus("RESOLVED")}
              >
                RESOLVED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Add Note Modal */}
      {showAddNoteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent2}>
            <button className={styles.modalClose} onClick={() => setShowAddNoteModal(false)}>
              &times;
            </button>
            <h3>Add Note for Hold Status:</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Please provide a reason for putting this issue on hold..."
              rows="4"
              className={styles.noteTextarea}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowAddNoteModal(false)}>
                Cancel
              </button>
              <button className={styles.updateButton} onClick={handleNoteSubmit}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className={styles.successMessageOverlay}>
          <div className={styles.successMessageContent}>
            <div className={styles.successHeader}>
              <img src={tickIcon || "/placeholder.svg"} alt="Success" className={styles.tickIcon} />
              <h3>Invitation Sent Successfully!</h3>
            </div>
            <p>The collaboration invitation has been sent to the selected technician.</p>
            <button className={styles.okButton} onClick={() => setShowSuccess(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default IssueDetails
