import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Chat.module.css";
import { FaPaperPlane, FaBars, FaSun, FaMoon, FaComment, FaSignOutAlt } from "react-icons/fa";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const chatBoxRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Scrolls to the bottom when new messages appear

  // Load chat history and selected role when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const [historyResponse, roleResponse] = await Promise.all([
          fetch("http://localhost:5000/api/interview/history", {
            credentials: "include"
          }),
          fetch("http://localhost:5000/api/interview/selected-role", {
            credentials: "include"
          })
        ]);
        
        if (!historyResponse.ok || !roleResponse.ok) {
          throw new Error("Failed to load chat history or selected role");
        }

        const histories = await historyResponse.json();
        const { role } = await roleResponse.json();
        
        // Convert histories to conversations format
        const loadedConversations = histories.map(history => 
          history.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        );

        setConversations(loadedConversations);
        setMessages([]);
        setCurrentConversationIndex(loadedConversations.length);
        setIsInterviewComplete(false);
        setSelectedRole(role);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, []);

  const sendMessage = useCallback(async (customMessage = null) => {
    const messageToSend = customMessage || message;
    if (messageToSend.trim() === "") return;

    const userMessage = { role: "human", content: messageToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!customMessage) setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsTyping(true); // Show typing indicator

    try {
      const response = await fetch("http://localhost:5000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userMessage: messageToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      const aiMessage = { role: "ai", content: data.aiResponse };
      const newMessages = [...updatedMessages, aiMessage];
      setMessages(newMessages);
      setIsInterviewComplete(data.interviewComplete);
      
      // Update current conversation if it exists
      if (currentConversationIndex < conversations.length) {
        const updatedConversations = [...conversations];
        updatedConversations[currentConversationIndex] = newMessages;
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      if (error.message.includes("Please upload your resume")) {
        navigate("/form2");
      }
    } finally {
      setIsTyping(false); // Hide typing indicator
    }
  }, [message, messages, currentConversationIndex, conversations, navigate]);

  // Auto-start interview when component mounts or when starting a new conversation
  useEffect(() => {
    const shouldStartInterview = messages.length === 0 && !isInterviewComplete;
    
    if (shouldStartInterview) {
      const startInterview = async () => {
        try {
          await sendMessage("Hi, I'm ready to start the interview.");
        } catch (error) {
          console.error("Failed to start interview:", error);
        }
      };
      startInterview();
    }
  }, [messages.length, isInterviewComplete, sendMessage]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // const startNewConversation = () => {
  //   if (messages.length > 0) {
  //     setConversations([...conversations, messages]);
  //   }
  //   setMessages([]);
  //   setCurrentConversationIndex(conversations.length);
  //   setIsInterviewComplete(false);
  //   // req.session.hasStartedInterview = false; // Reset interview state
  // };

  const loadConversation = (index) => {
    if (messages.length > 0 && currentConversationIndex === conversations.length) {
      setConversations([...conversations, messages]);
    }
    setMessages(conversations[index]);
    setCurrentConversationIndex(index);
    // Check if this conversation is complete
    const isComplete = messages.some(msg => 
      msg.content.includes("Overall interview performance") && 
      msg.content.includes("Key strengths demonstrated")
    );
    setIsInterviewComplete(isComplete);
  };

  const getConversationPreview = (messages) => {
    if (!messages || messages.length === 0) return "New Conversation";
    const firstUserMessage = messages.find(msg => msg.role === "human");
    if (!firstUserMessage) return "New Conversation";
    return firstUserMessage.content.length > 30 
      ? firstUserMessage.content.substring(0, 30) + "..."
      : firstUserMessage.content;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`${styles.page} ${!isDarkTheme ? styles.lightTheme : ""}`}>
      <div className={`${styles.container} ${!isSidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>{selectedRole ? `${selectedRole} Interview` : 'Chat History'}</h2>
          </div>
          <div className={styles.history}>
            {conversations.map((conv, index) => (
              <button 
                key={index} 
                className={`${styles.conversationButton} ${index === currentConversationIndex ? styles.active : ''}`}
                onClick={() => loadConversation(index)}
              >
                <FaComment className={styles.historyIcon} /> {getConversationPreview(conv)}
              </button>
            ))}
            {messages.length > 0 && currentConversationIndex === conversations.length && (
              <button 
                className={`${styles.conversationButton} ${styles.active}`}
                onClick={() => {}}
              >
                <FaComment className={styles.historyIcon} /> {getConversationPreview(messages)}
              </button>
            )}
          </div>
        </aside>

        <button
          className={styles.toggleButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        <main className={styles.mainContent}>
          <div className={styles.chatHeader}>
            <h1 className={styles.chatTitle}>AI-PrepTalk</h1>
            {isInterviewComplete && (
              <div className={styles.interviewComplete}>
                Interview Complete
              </div>
            )}
          </div>

          <div className={styles.chatBox} ref={chatBoxRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  msg.role === "human" ? styles.userMessage : styles.aiMessage
                }`}
              >
                <div className={styles.avatar}>
                  {msg.role === "human" ? "👤" : "🤖"}
                </div>
                <div className={styles.messageContent}>{msg.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.message} ${styles.aiMessage}`}>
                <div className={styles.avatar}>🤖</div>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                className={styles.input}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isInterviewComplete ? "Interview completed. Review the feedback above." : "Type your message..."}
                disabled={isInterviewComplete}
              />
              <button 
                className={styles.sendButton} 
                onClick={() => sendMessage()}
                disabled={isInterviewComplete || !message.trim()}
                aria-label="Send message"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </main>

        <button 
          className={styles.themeToggle} 
          onClick={toggleTheme}
          aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
        >
          {isDarkTheme ? <FaSun /> : <FaMoon />}
        </button>

        <button 
          className={styles.logoutButton} 
          onClick={handleLogout}
          aria-label="Logout"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
};

export default Chat;
