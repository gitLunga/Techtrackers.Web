
import { useState, useRef, useEffect } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import styles from "../SidebarCSS/LiveChatStyle.module.css"
import ProfileIcon from "../images/profile_iconlivechat.png"
import { useNavigate } from "react-router-dom"
import * as signalR from "@microsoft/signalr"

function TechncianLiveChat() {
  const userInfo = JSON.parse(localStorage.getItem("user_info"))
  const userId = userInfo?.userId || 0
  const staffName = userInfo?.name || "You"

  const [text, setText] = useState("")
  const [chatLog, setChatLog] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [connection, setConnection] = useState(null)
  const messagesEndRef = useRef(null)

  const storedLogs = JSON.parse(localStorage.getItem("Tech Issues")) || []
  const selectedIssueId = localStorage.getItem("selected_issue_id")
  const relevantLog = storedLogs.find((log) => log.issueId === selectedIssueId)
  const logId = relevantLog ? relevantLog.logId : null

  useEffect(() => {
    if (!logId) {
      console.error("⚠️ No logId found for the selected issue.")
      setError("No logId found! Unable to start chat.")
      setIsLoading(false)
      return
    }

    const connectToSignalR = async () => {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:44328/chatHub")
        .withAutomaticReconnect()
        .build()

      try {
        await newConnection.start()
        console.log("✅ Connected to SignalR")
        setIsConnected(true)
        await newConnection.invoke("JoinLogChat", Number.parseInt(logId))

        newConnection.on("ReceiveMessage", (logId, senderId, message, timestamp) => {
          setChatLog((prevChat) => {
            const alreadyExists = prevChat.some(
              (chat) =>
                chat.text === message &&
                chat.senderId === senderId &&
                chat.time === new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            )

            if (!alreadyExists) {
              return [
                ...prevChat,
                {
                  senderId,
                  text: message,
                  time: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ]
            }
            return prevChat
          })
        })

        newConnection.onreconnecting(() => {
          setIsConnected(false)
          toast.info("Reconnecting to chat...")
        })

        newConnection.onreconnected(() => {
          setIsConnected(true)
          toast.success("Reconnected to chat!")
        })

        newConnection.onclose(() => {
          setIsConnected(false)
          toast.error("Chat connection lost")
        })

        setConnection(newConnection)
      } catch (err) {
        console.error("❌ Connection failed:", err)
        setError("Chat connection failed.")
        setIsConnected(false)
      }
    }

    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`https://localhost:44328/api/LiveChat/GetMessages/${logId}`)
        if (response.ok) {
          const messages = await response.json()
          setChatLog(
            messages.map((msg) => ({
              senderId: msg.senderId,
              text: msg.message,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            })),
          )
        } else {
          setError("Error loading chat history.")
        }
      } catch (error) {
        setError("Failed to load chat messages.")
      } finally {
        setIsLoading(false)
      }
    }

    connectToSignalR()
    fetchChatHistory()

    return () => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.stop().catch((err) => console.error("❌ Error disconnecting:", err))
      }
    }
  }, [logId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatLog])

  const handleSendText = async () => {
    if (text.trim() === "") {
      toast.warning("⚠️ Cannot send an empty message!")
      return
    }

    if (!isConnected) {
      toast.error("❌ Not connected to chat. Please wait for reconnection.")
      return
    }

    const tempMessage = {
      senderId: userId,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isPending: true,
    }

    setChatLog((prev) => [...prev, tempMessage])
    const messageToSend = text
    setText("")

    try {
      const response = await fetch("https://localhost:44328/api/LiveChat/SendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, senderId: userId, message: messageToSend }),
      })

      if (response.ok) {
        setChatLog((prev) =>
          prev.map((msg) => (msg.isPending && msg.text === messageToSend ? { ...msg, isPending: false } : msg)),
        )
        toast.success("✅ Message sent!")
      } else {
        setChatLog((prev) => prev.filter((msg) => !(msg.isPending && msg.text === messageToSend)))
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to send message.")
      }
    } catch (error) {
      setChatLog((prev) => prev.filter((msg) => !(msg.isPending && msg.text === messageToSend)))
      toast.error("Network error. Check your connection.")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading chat...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3>Chat Error</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.mainContainerChat}>
      <div className={styles.chatContainer}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.issueProfile}>
            <img src={ProfileIcon || "/placeholder.svg"} alt="Profile" height={60} className={styles.profileImage} />
            <div className={styles.titleId}>
              <h4 className={styles.technicianName}>{relevantLog?.issueTitle}</h4>
              <p>#{relevantLog?.issueId}</p>
            </div>
          </div>
          <div className={styles.connectionStatus}>
            <span className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}>
              {isConnected ? "🟢" : "🔴"}
            </span>
            <span className={styles.statusText}>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div className={styles.closeIcon} onClick={() => navigate(-1)}>
            ✖
          </div>
        </div>

        {/* Chat Messages */}
        <div className={styles.chatBox}>
          <div className={styles.texts}>
            {chatLog.length === 0 ? (
              <div className={styles.emptyChatMessage}>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatLog.map((msg, index) => (
                <div
                  key={index}
                  className={`${msg.senderId === userId ? styles.userMessage : styles.techMessage} ${msg.isPending ? styles.pendingMessage : ""}`}
                >
                  <p>{msg.text}</p>
                  <span className={styles.timeStamp}>
                    {msg.time}
                    {msg.isPending && <span className={styles.pendingIndicator}>⏳</span>}
                  </span>
                </div>
              ))
            )}
            {isTyping && <p className={styles.typingIndicator}>User is typing...</p>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Field */}
        <div className={styles.messageField}>
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setIsTyping(e.target.value.length > 0)
            }}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className={!isConnected ? styles.disabledInput : ""}
          />
          <button
            className={`${styles.sendButton} ${!isConnected || !text.trim() ? styles.disabledButton : ""}`}
            onClick={handleSendText}
            disabled={!isConnected || !text.trim()}
          >
            📩
          </button>
        </div>
      </div>
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

export default TechncianLiveChat
