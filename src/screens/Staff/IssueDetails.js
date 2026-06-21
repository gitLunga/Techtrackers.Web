"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import "./StaffStyle/IssueDetails.css"
import { FaPaperclip } from "react-icons/fa"
import "react-toastify/dist/ReactToastify.css"
import { toast, ToastContainer } from "react-toastify"

export default function IssueDetails({ issue = {}, onClose, onOpenChat }) {
  // Initialize with an empty object if issue is undefined
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false)
  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false)
  const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false)
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isRatingPopupOpen, setIsRatingPopupOpen] = useState(false)
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false) // New state to track if rating is submitted

  //  const issueId = issue;

  //  console.log(issueId);

  const handleRating = (value) => setRating(value)

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "status-resolved"
      case "inprogress":
        return "status-inprogress"
      case "pending":
        return "status-pending"
      case "escalated":
        return "status-escalated"
      case "onhold":
        return "status-onhold"
      default:
        return ""
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-low"
    }
  }

  const handleUnresolvedClick = () => {
    setIsFeedbackPopupOpen(true)
  }

  const handleResolvedClick = () => {
    setIsConfirmationPopupOpen(true)
  }

  const closeFeedbackPopup = () => {
    setIsFeedbackPopupOpen(false)
  }

  const closeErrorPopup = () => {
    setIsErrorPopupOpen(false)
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value)
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setIsErrorPopupOpen(true)
      return
    }

    const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}")

    // ✅ Get logId from localStorage (set when issue was selected)
    const logId = localStorage.getItem("selected_log_id")

    if (!logId) {
      toast.error("No issue selected. Cannot submit feedback.")
      return
    }

    const feedbackData = {
      Log_ID: Number.parseInt(logId, 10), // Ensure it's parsed as integer
      User_ID: userInfo.userId,
      Rating: rating,
      Comment: comment,
    }

    try {
      const response = await fetch("https://localhost:44328/api/Feedback/SubmitFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      })

      if (response.ok) {
        const newFeedback = await response.json()
        setIsRatingPopupOpen(false)
        setComment("")
        setRating(0)
        setIsRatingSubmitted(true) // Set this to true when rating is submitted
        toast.success("Feedback submitted successfully!")
      } else {
        const errorText = await response.text()
        toast.error(`Failed to submit feedback: ${errorText}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date)) throw new Error("Invalid Date")

      const options = { year: "numeric", month: "long", day: "numeric" }
      const datePart = new Intl.DateTimeFormat("en-US", options).format(date)

      let hours = date.getHours()
      const minutes = String(date.getMinutes()).padStart(2, "0")
      const amPm = hours >= 12 ? "PM" : "AM"
      hours = hours % 12 || 12

      const timePart = `${hours}:${minutes} ${amPm}`
      return `${datePart}, ${timePart}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const handleAttachmentClick = () => {
    setIsAttachmentOpen(true)
  }

  const closeAttachment = () => {
    setIsAttachmentOpen(false)
  }

  const closeConfirmationPopup = () => {
    setIsConfirmationPopupOpen(false)
    setIsRatingPopupOpen(true)
  }

  const handleNoteClick = () => {
    if (issue.note) {
      setIsNoteModalOpen(true)
    } else {
      toast.info("No technician note available yet.")
    }
  }

  const closeNoteModal = () => {
    setIsNoteModalOpen(false)
  };



  // Check if issue is undefined or null
  if (!issue) {
    return (
      <div className="issue-deta">
        <p>No issue data available.</p>
        <button className="c-btn" onClick={onClose}>
          Close
        </button>
      </div>
    )
  }

  return (
    <main className="issue-deta">
      <div className="title">
        <h1>{issue.issueTitle || "Untitled Issue"}</h1>
      </div>
      <div className="issue-in-fo">
        <div className="in-fo-group">
          <p> 🏬 Department - {issue.department || "Unknown"}</p>
          <p>Location: {issue.location || "No location provided"}</p>
        </div>
        <div className="in-fo-group">
          <p>
            Priority: <span className={`prioritx ${getPriorityClass(issue.priority)}`}>{issue.priority || "Low"}</span>
          </p>
          <p>
            Status:{" "}
            <span className={`issue-status ${getStatusClass(issue.status?.toLowerCase())}`}>
              {issue.status || "Open"}
            </span>
          </p>
        </div>
        <div className="in-fo-group">
          <p>Date of Issue: {formatDateTime(issue.issuedAt)}</p>
          <button className="live-chat-btn" onClick={onOpenChat}>
            Live Chat
          </button>{" "}
        </div>
        <div style={{ marginTop: '5px' }}>
          <button className="view-note-btn" onClick={handleNoteClick}>View Technician Note</button>
        </div>
      </div>
      <div className="descrip-section">
        <h3>
          <FileText /> Description
        </h3>
        <p>{issue.description || "No description provided."}</p>
      </div>

      {issue.attachmentBase64 && (
        <div className="attach-section">
          <h3>
            <FaPaperclip /> Attachments
          </h3>
          <div className="attach">
            <a href="#" onClick={handleAttachmentClick}>
              View attachment
            </a>
          </div>
        </div>
      )}

      {isAttachmentOpen && issue.attachmentBase64 && (
        <div className="attachment-modal">
          <div className="attachment-modal-content">
            <span className="close-modal" onClick={closeAttachment}>
              &times;
            </span>
            <img
              src={`data:image/jpeg;base64,${issue.attachmentBase64}`}
              alt="Attachment"
              className="attachment-image"
            />
          </div>
        </div>
      )}

      <div className="close-btn">
        <button className="c-btn" onClick={onClose}>
          Close
        </button>
        <button
          className={`Unresolved-btn ${isRatingSubmitted ? "disabled-btn" : ""}`}
          onClick={handleUnresolvedClick}
          disabled={isRatingSubmitted} // Disable the button if rating is submitted
        >
          Unresolved
        </button>
        <button
          className={`Resolved-btn ${isRatingSubmitted ? "disabled-btn" : ""}`}
          onClick={handleResolvedClick}
          disabled={isRatingSubmitted} // Disable the button if rating is submitted
        >
          Resolved
        </button>
      </div>

      {isFeedbackPopupOpen && (
        <div className="feedback-popup">
          <div className="feedback-popup-content">
            <span className="close-popup-btn" onClick={closeFeedbackPopup}>
              &times;
            </span>
            <p>Your feedback has been noted, and the issue has been reopened for further investigation.</p>
            <button className="ok-btn" onClick={closeFeedbackPopup}>
              OK
            </button>
          </div>
        </div>
      )}

      {isConfirmationPopupOpen && (
        <div className="confirmation-popup">
          <div className="confirmation-popup-content">
            <h3 style={{ color: "green" }}>CONFIRM!!</h3>
            <p>Thank You, The issue has been marked resolved.</p>
            <button className="ok-btn" onClick={closeConfirmationPopup}>
              OK
            </button>
          </div>
        </div>
      )}

      {isRatingPopupOpen && (
        <div className="rating-popup">
          <div className="rating-popup-content">
            <h3 style={{ color: "green" }}>Rate your experience with the technician?</h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleRating(star)} // This updates the rating state
                  style={{
                    cursor: "pointer",
                    fontSize: "24px",
                    color: star <= rating ? "gold" : "gray",
                  }}
                >
                  {star <= rating ? "★" : "☆"}
                </span>
              ))}
            </div>
            <textarea
              placeholder="Additional Comment [optional]"
              value={comment}
              onChange={handleCommentChange}
              rows={4}
              style={{ width: "100%", marginTop: "10px" }}
            />
            <button className="submit-rating-btn" onClick={handleSubmitRating}>
              Submit
            </button>
            <button className="rating-popup-close" onClick={() => setIsRatingPopupOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {isErrorPopupOpen && (
        <div className="error-popup">
          <div className="error-popup-content">
            <h2 style={{ color: "red" }}>Error</h2>
            <p>Please select a rating before submitting.</p>
            <button className="ok-btn" onClick={closeErrorPopup}>
              OK
            </button>
          </div>
        </div>
      )}

      {isNoteModalOpen && (
        <div className="note-popup">
          <div className="note-popup-content">
            <span className="close-popup-btn" onClick={closeNoteModal}>&times;</span>
            <h3>Note</h3>
            <p className="note-text">{issue.note}</p>
          </div>
        </div>
      )}


      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </main>
  )
}