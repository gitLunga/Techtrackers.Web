import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Send, ArrowLeft, Paperclip, UserCircleIcon } from "lucide-react";
import styles from "../SidebarCSS/ViewAllLiveChat.module.css"; // Adjust path if necessary
import placement from "../adminIcons/images/profile.png";
const initialMessages = [
  {
    id: 1,
    sender: "Lunga Ntshingila",
    content:
      "Hello, I've received your issue about the printer in Building 18. The picture you attached is not clear enough. Could you please send a clear screenshot of the error message displayed on the screen?",
    timestamp: "12:34",
    attachment: null,
  },
  {
    id: 2,
    sender: "User",
    content: "Here is an error code displayed on the screen.",
    timestamp: "12:36",
    attachment: {
      name: "error_screenshot.png",
      url: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    id: 3,
    sender: "Lunga Ntshingila",
    content:
      "It looks like a driver issue based on the error code. I'll reset the drivers remotely and let you know once it's done. Thank you.",
    timestamp: "12:37",
    attachment: null,
  },
];

function LiveChat({ onClose }) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "" || attachment) {
      const newMsg = {
        id: messages.length + 1,
        sender: "User",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachment: attachment,
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
      setAttachment(null);

      // Simulate technician AI response after user message
      setTimeout(() => {
        handleAIResponse(newMsg.content);
      }, 1000); // Adjust the delay for AI response as needed
    }
  };

  const handleAIResponse = (userMessage) => {
    let aiResponseContent = "";

    if (userMessage.toLowerCase().includes("printer")) {
      aiResponseContent =
        "It seems like there might be a connectivity issue with the printer. Please check if the printer is powered on and connected to the network.";
    } else if (userMessage.toLowerCase().includes("error code")) {
      aiResponseContent =
        "Thanks for the error code. It usually indicates a driver problem. I recommend checking for driver updates or reinstalling the printer drivers.";
    } else if (userMessage.toLowerCase().includes("not working")) {
      aiResponseContent =
        "I understand the issue. Please try restarting the printer and see if that resolves the problem.";
    } else {
      aiResponseContent =
        "I'm here to help! Can you provide more details about your issue?";
    }

    const aiResponse = {
      id: messages.length + 2,
      sender: "Technician",
      content: aiResponseContent,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachment: null,
    };

    setMessages((prevMessages) => [...prevMessages, aiResponse]);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachment({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles["live-chat-fullscreen"]}>
      <div className={styles["chat-header"]}>
        <button className={styles["back-button"]} onClick={onClose}>
          <ArrowLeft size={30} />
        </button>
        <h2>
          <UserCircleIcon size={40} /> Lunga Ntshingila
        </h2>
      </div>
      <div className={styles["chat-messages"]}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles["message"]} ${
              message.sender === "User"
                ? styles["user"]
                : message.sender === "Technician"
                ? styles["technician"]
                : styles["staff"]
            }`}
          >
            <div className={styles["message-content"]}>
              {message.content}
              {message.attachment && (
                <div className={styles["attachment-preview"]}>
                  <img
                    src={message.attachment.url}
                    alt={message.attachment.name}
                  />
                  <span>{message.attachment.name}</span>
                </div>
              )}
            </div>
            <div className={styles["message-timestamp"]}>
              {message.timestamp}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className={styles["chat-input"]}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className={styles["attachment-button"]}
          onClick={handleAttachmentClick}
        >
          <Paperclip size={20} />
        </button>
        <button className={styles["send-b"]} onClick={handleSendMessage}>
          <Send size={20} />
        </button>
      </div>
      {attachment && (
        <div className={styles["attachment-preview"]}>
          <img src={attachment.url} alt={attachment.name} />
          <span>{attachment.name}</span>
          <button onClick={() => setAttachment(null)}>Remove</button>
        </div>
      )}
      {!attachment && (
        <div className={styles["attachment-preview"]}>
          <img
            src={"/placeholder.svg"}
            alt="Placeholder"
            style={{ width: "100px", height: "100px" }}
          />
          <span>No attachment selected</span>
        </div>
      )}
    </div>
  );
}

LiveChat.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default LiveChat;
