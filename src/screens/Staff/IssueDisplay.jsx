"use client"

import React, { useState } from 'react'
import MainContent from './MainContent'
import IssueDetails from './IssueDetails'
import LiveChat from './LiveChat'
//import styles from './StaffStyle/MainContent.module.css'

export default function IssueDisplay() {
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Open chat function
  const handleOpenChat = () => {
    setIsChatOpen(true)
  }

  // Close chat function
  const handleCloseChat = () => {
    setIsChatOpen(false)
  }

  // Select issue function
  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue)
  }

  return (
    <div className="app">
      <div className="main-container">
        {selectedIssue ? (
          <IssueDetails 
            issue={selectedIssue} 
            onClose={() => setSelectedIssue(null)} 
            onOpenChat={handleOpenChat} // Pass handleOpenChat to IssueDetails
          />
        ) : (
          <MainContent 
            onSelectIssue={handleSelectIssue} 
            onOpenChat={handleOpenChat} // Pass handleOpenChat to MainContent
          />
        )}
      </div>
      {isChatOpen && <LiveChat
          onClose={handleCloseChat}
          selectedIssue={selectedIssue} // Pass selectedIssue to LiveChat
        />} {/* Render LiveChat if isChatOpen is true */}
    </div>
  )
}