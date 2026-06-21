"use client"

import { useState, useEffect, useRef } from "react"
import { FaPlusCircle } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useNavigate } from "react-router-dom"
import styles from "../Staff/StaffStyle/logissue.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faQrcode, faTimes, faUpload, faTrash } from "@fortawesome/free-solid-svg-icons"
import QrScanner from "react-qr-scanner"
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons"

const Logissueform = () => {
  const categoryMap = {
    CARPENTRY: 1,
    ELECTRICAL: 2,
    ENGRAVING: 3,
    GENERAL: 4,
    LIFTS: 5,
    "AIR CONDITIONER": 6,
    BUILDING: 7,
    METALWORK: 8,
    PAINTING: 9,
  }

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState({
    title: "",
    category: "",
    department: "Human Resource (HR)",
    priority: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    buildingNumber: "",
    attachmentFiles: [],
  })
  const [errors, setErrors] = useState({})
  const [filePreviews, setFilePreviews] = useState([])
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState("")
  const scannerRef = useRef(null)
  const [scannedData, setScannedData] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState(null)

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user_info"))

    if (userInfo && userInfo.department) {
      setFormValues((prevValues) => ({
        ...prevValues,
        department: userInfo.department,
      }))
    } else {
      console.warn("No department found in user_info.")
      setFormValues((prevValues) => ({
        ...prevValues,
        department: "Unknown Department",
      }))
    }
  }, [])

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')

      setFormValues(prev => ({
        ...prev,
        description: transcript
      }))
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      toast.error(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (isListening) {
        recognition.start()
      }
    }

    setSpeechRecognition(recognition)

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [isListening])

  // Add this function to toggle voice input
  const toggleVoiceInput = () => {
    if (!speechRecognition) {
      toast.error("Speech recognition not supported in your browser")
      return
    }

    if (isListening) {
      speechRecognition.stop()
      setIsListening(false)
      toast.info("Voice input stopped")
    } else {
      try {
        speechRecognition.start()
        setIsListening(true)
        toast.info("Speak now - your voice is being recorded")
      } catch (error) {
        console.error("Speech recognition start error:", error)
        toast.error("Failed to start voice input")
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formValues.title.trim()) {
      newErrors.title = "Issue title is required"
    }

    if (!formValues.category) {
      newErrors.category = "Category is required"
    }

    if (!formValues.priority) {
      newErrors.priority = "Priority level is required"
    }

    if (!formValues.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formValues.location) {
      newErrors.location = "Location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: name === "category" ? Number.parseInt(value) : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }))
    }
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    const validFiles = files.filter((file) => {
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has an unsupported format.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setFormValues((prevValues) => ({
        ...prevValues,
        attachmentFiles: [...prevValues.attachmentFiles, ...validFiles],
      }))

      // Generate previews for image files
      const newPreviews = validFiles.map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file)
        }
        return null
      })
      setFilePreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
    }
  }

  const removeFile = (index) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      attachmentFiles: prevValues.attachmentFiles.filter((_, i) => i !== index),
    }))

    // Clean up preview URL
    if (filePreviews[index]) {
      URL.revokeObjectURL(filePreviews[index])
    }
    setFilePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      toast.error("Please fill in all required fields.")
      return
    }

    const userInfo = JSON.parse(localStorage.getItem("user_info"))
    const staffId = userInfo?.userId

    if (!staffId) {
      toast.error("User ID is missing. Please log in again.")
      return
    }

    setIsSubmitting(true)

    const fullLocation = formValues.location
      ? formValues.buildingNumber
        ? `${formValues.location}-${formValues.buildingNumber}`
        : formValues.location
      : "Location not specified"

    const formData = new FormData()
    formData.append("Issue_Title", formValues.title)
    formData.append("Category_ID", formValues.category)
    formData.append("Department", formValues.department)
    formData.append("Description", formValues.description)
    formData.append("Priority", formValues.priority)
    formData.append("Created_at", formValues.date)
    formData.append("Location", fullLocation)
    formData.append("Staff_ID", staffId)

    // Append each file to the FormData
    formValues.attachmentFiles.forEach((file) => {
      formData.append(`AttachmentFile`, file)
    })

    try {
      const response = await fetch("https://localhost:44328/api/Log/CreateLog", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setSubmitted(true)
        setFormValues({
          title: "",
          category: "",
          department: userInfo?.department || "",
          priority: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          location: "",
          buildingNumber: "",
          attachmentFiles: [],
        })
        setFilePreviews([])
        setErrors({})
        toast.success("Issue logged successfully!")

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/staffdashboard/IssueDisplay")
        }, 3000)
      } else {
        const errorData = await response.json()
        console.error("Error details from server:", errorData)
        toast.error(`Failed to submit the issue: ${errorData.title || "Validation error"}`)
      }
    } catch (error) {
      console.error("Network or server error:", error)
      toast.error("An error occurred while submitting the issue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/staffdashboard/WelcomeStaff")
  }

  const handleView = () => {
    navigate("/staffdashboard/IssueDisplay")
  }

  const handleScan = (data) => {
    if (data && !scannedData) {
      try {
        const parts = data.text.split(" | ").reduce((acc, part) => {
          const [key, value] = part.split(": ").map((item) => item.trim())
          if (key && value) acc[key] = value
          return acc
        }, {})

        setScannedData({
          title: parts.title,
          category: categoryMap[parts.category?.toUpperCase()],
          location: parts.location?.split("-")[0],
          buildingNumber: parts.location?.split("-")[1],
        })

        stopScanner()
        toast.success("QR code scanned successfully!")
      } catch (error) {
        toast.error("Invalid QR format. Please try another code.")
      }
    }
  }

  const applyScannedData = () => {
    if (scannedData) {
      setFormValues((prev) => ({
        ...prev,
        ...scannedData,
      }))
      setScannedData(null)
      toast.success("Scanned data applied to form!")
    }
  }

  const cancelScannedData = () => {
    setScannedData(null)
  }

  const handleError = (err) => {
    console.error("QR Scanner error:", err)
    toast.error("Error scanning QR code. Please try again.")
  }

  const startScanner = () => {
    setIsScanning(true)
    setScanResult("")
  }

  const stopScanner = () => {
    setIsScanning(false)
  }

  const previewStyle = {
    height: 300,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    margin: "10px 0",
    borderRadius: "8px",
    overflow: "hidden",
  }

  return (
    <div className={styles.mainContent}>
      <ToastContainer position="top-right" autoClose={5000} />

      {submitted && (
        <div className={styles.successMessage}>
          <h3>✅ Issue Submitted Successfully!</h3>
          <p>
            Thank you for reporting this issue. Your log has been submitted successfully. You can{" "}
            <button onClick={handleView} className={styles.linkButton}>
              view it
            </button>{" "}
            in your logged issues.
          </p>
          <p className={styles.redirectMessage}>Redirecting to issues page in 3 seconds...</p>
        </div>
      )}

      <form className={styles.logIssueForm} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h2>
            <FaPlusCircle className={styles.headerIcon} />
            LOG ISSUE
          </h2>
          <p className={styles.formDescription}>
            Please provide detailed information about the issue you're experiencing.
          </p>
        </div>

        <div className={styles.formRow}>
          <div className={styles.Box}>
            <label htmlFor="issue-title">
              Issue Title <span className={styles.Required}>*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              name="title"
              placeholder="Brief description of the issue"
              value={formValues.title}
              onChange={handleChange}
              className={errors.title ? styles.errorInput : ""}
              maxLength={100}
            />
            {errors.title && <p className={styles.errorMessage}>{errors.title}</p>}
          </div>

          <div className={styles.Box}>
            <label htmlFor="category">
              Category <span className={styles.Required}>*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formValues.category}
              onChange={handleChange}
              className={errors.category ? styles.errorInput : ""}
            >
              <option value="">Select Category</option>
              <option value={1}>CARPENTRY</option>
              <option value={2}>ELECTRICAL</option>
              <option value={3}>ENGRAVING</option>
              <option value={4}>GENERAL (Water Proofing, Blinds, and Glass Replacement)</option>
              <option value={5}>LIFTS</option>
              <option value={6}>AIR CONDITIONER</option>
              <option value={7}>BUILDING</option>
              <option value={8}>METALWORK</option>
              <option value={9}>PAINTING</option>
            </select>
            {errors.category && <p className={styles.errorMessage}>{errors.category}</p>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.Box}>
            <label htmlFor="department">Department</label>
            <input
              id="department"
              type="text"
              name="department"
              value={formValues.department}
              onChange={handleChange}
              readOnly
              className={styles.readOnlyInput}
            />
          </div>

          <div className={styles.Box}>
            <label htmlFor="priority">
              Priority Level <span className={styles.Required}>*</span>
            </label>
            <select
              id="priority"
              name="priority"
              value={formValues.priority}
              onChange={handleChange}
              className={errors.priority ? styles.errorInput : ""}
            >
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            {errors.priority && <p className={styles.errorMessage}>{errors.priority}</p>}
          </div>
        </div>

        <div className={styles.Box}>
          <label htmlFor="description">
            Description <span className={styles.Required}>*</span>
          </label>
          <div className={styles.descriptionContainer}>
            <textarea
              id="description"
              name="description"
              placeholder="Provide detailed information about the issue..."
              rows="4"
              value={formValues.description}
              onChange={handleChange}
              className={errors.description ? styles.errorInput : ""}
              maxLength={1000}
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`${styles.voiceInputButton} ${isListening ? styles.listening : ''}`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
            >
              <FontAwesomeIcon
                icon={isListening ? faMicrophoneSlash : faMicrophone}
                className={styles.voiceIcon}
              />
            </button>
          </div>
          <div className={styles.characterCount}>{formValues.description.length}/1000 characters</div>
          {errors.description && <p className={styles.errorMessage}>{errors.description}</p>}
        </div>

        <div className={styles.Box}>
          <label htmlFor="date">Date</label>
          <input id="date" type="date" name="date" value={formValues.date} readOnly className={styles.readOnlyInput} />
        </div>

        <div className={styles.formRow}>
          <div className={styles.Box}>
            <label htmlFor="location">
              Location <span className={styles.Required}>*</span>
            </label>
            <select
              id="location"
              name="location"
              value={formValues.location}
              onChange={handleChange}
              className={errors.location ? styles.errorInput : ""}
            >
              <option value="">Select Location</option>
              <option value="TUT Building 18">TUT Building 18</option>
              <option value="Main Office">Main Office</option>
              <option value="Remote Site">Remote Site</option>
            </select>
            {errors.location && <p className={styles.errorMessage}>{errors.location}</p>}
          </div>

          <div className={styles.Box}>
            <label htmlFor="buildingNumber">Building Number</label>
            <select id="buildingNumber" name="buildingNumber" value={formValues.buildingNumber} onChange={handleChange}>
              <option value="">Select Building Number</option>
              <option value="G45H">G45H</option>
              <option value="F23B">F23B</option>
              <option value="D12C">D12C</option>
              <option value="A1">A1</option>
              <option value="B2">B2</option>
            </select>
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className={styles.qrScannerSection}>
          <label>Scan QR Code for Location</label>
          <div className={styles.scannerControls}>
            {!isScanning ? (
              <button type="button" className={styles.scanButton} onClick={startScanner}>
                <FontAwesomeIcon className={styles.QRicon} icon={faQrcode} />
                Start QR Scanner
              </button>
            ) : (
              <button type="button" className={styles.stopScanButton} onClick={stopScanner}>
                <FontAwesomeIcon className={styles.QRicon} icon={faTimes} />
                Stop Scanner
              </button>
            )}
          </div>

          {isScanning && (
            <div className={styles.scannerContainer}>
              <QrScanner
                ref={scannerRef}
                delay={300}
                style={previewStyle}
                onError={handleError}
                onScan={handleScan}
                facingMode="environment"
              />
              <p className={styles.scannerHint}>Point your camera at a QR code to scan location data</p>
            </div>
          )}

          {scannedData && (
            <div className={styles.scanPreview}>
              <h3>📱 Scanned Data Preview</h3>
              <div className={styles.scanPreviewContent}>
                <p>
                  <strong>Title:</strong> {scannedData.title}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {Object.keys(categoryMap).find((key) => categoryMap[key] === scannedData.category)}
                </p>
                <p>
                  <strong>Location:</strong>
                  {scannedData.location}
                  {scannedData.buildingNumber ? `-${scannedData.buildingNumber}` : ""}
                </p>
              </div>

              <div className={styles.scanPreviewButtons}>
                <button type="button" onClick={applyScannedData} className={styles.applyButton}>
                  Apply to Form
                </button>
                <button type="button" onClick={cancelScannedData} className={styles.cancelScanButton}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className={styles.fileInputWrapper}>
          <label htmlFor="attachments">
            <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
            Attachments (Screenshots, Photos, Documents)
          </label>
          <div className={styles.fileUploadArea}>
            <input
              id="attachments"
              type="file"
              name="attachmentFiles"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              className={styles.fileInput}
            />
            <div className={styles.fileUploadText}>
              <p>Click to select files or drag and drop</p>
              <p className={styles.fileFormatHint}>Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (Max 10MB each)</p>
            </div>
          </div>

          {/* File Preview */}
          {formValues.attachmentFiles.length > 0 && (
            <div className={styles.filePreviewContainer}>
              <h4>📎 Attached Files ({formValues.attachmentFiles.length})</h4>
              <div className={styles.fileList}>
                {formValues.attachmentFiles.map((file, index) => (
                  <div key={index} className={styles.fileItem}>
                    <div className={styles.fileInfo}>
                      {filePreviews[index] ? (
                        <img
                          src={filePreviews[index] || "/placeholder.svg"}
                          alt={file.name}
                          className={styles.filePreview}
                        />
                      ) : (
                        <div className={styles.fileIcon}>📄</div>
                      )}
                      <div className={styles.fileDetails}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className={styles.removeFileButton}
                      aria-label={`Remove ${file.name}`}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.FformButons}>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Submitting...
              </>
            ) : (
              "Submit Issue"
            )}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default Logissueform
