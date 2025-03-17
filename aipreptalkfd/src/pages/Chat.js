import React, { useState, useRef, useEffect } from "react";
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
  const chatBoxRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();


  // useEffect(() => {
  //   const fetchChatHistory = async () => {
  //     try {
  //       const res = await fetch("http://localhost:5000/api/chat/history", {
  //         method: "GET",
  //         credentials: "include",
  //       });
  //       const data = await res.json();
  //       setMessages(data); // Load previous chat messages
  //     } catch (error) {
  //       console.error("Failed to fetch chat history:", error);
  //     }
  //   };
  
  //   if (user) fetchChatHistory();
  // }, [user]);
  

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

  const startNewConversation = () => {
    if (messages.length > 0) {
      setConversations([...conversations, messages]);
    }
    setMessages([]);
    setCurrentConversationIndex(conversations.length);
  };

  const loadConversation = (index) => {
    if (messages.length > 0 && currentConversationIndex === conversations.length) {
      setConversations([...conversations, messages]);
    }
    setMessages(conversations[index]);
    setCurrentConversationIndex(index);
  };

  const getConversationPreview = (messages) => {
    if (!messages || messages.length === 0) return "New Conversation";
    const firstUserMessage = messages.find(msg => msg.role === "human");
    if (!firstUserMessage) return "New Conversation";
    return firstUserMessage.content.length > 30 
      ? firstUserMessage.content.substring(0, 30) + "..."
      : firstUserMessage.content;
  };

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = { role: "human", content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("http://localhost:5000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userMessage: message, chatHistory: messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      const aiMessage = { role: "ai", content: data.aiResponse };
      const newMessages = [...updatedMessages, aiMessage];
      setMessages(newMessages);
      
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
    }
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
      <button 
        className={styles.toggleSidebar} 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <FaBars />
      </button>

      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        aria-label="Toggle theme"
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

      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2>Conversations</h2>
        </div>
        <div className={styles.history}>
          <button className={styles.newChatButton} onClick={startNewConversation}>
            <FaComment /> New Chat
          </button>
          {conversations.map((conv, index) => (
            <button 
              key={index} 
              className={`${styles.conversationButton} ${index === currentConversationIndex ? styles.active : ''}`}
              onClick={() => loadConversation(index)}
            >
              <FaComment /> {getConversationPreview(conv)}
            </button>
          ))}
          {messages.length > 0 && currentConversationIndex === conversations.length && (
            <button 
              className={`${styles.conversationButton} ${styles.active}`}
              onClick={() => {}}
            >
              <FaComment /> {getConversationPreview(messages)}
            </button>
          )}
        </div>
      </aside>
      
      <main className={styles.mainContent}>
        <div className={styles.chatHeader}>
          <h1 className={styles.chatTitle}>AI-PrepTalk</h1>
        </div>

        <div className={styles.chatBox} ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.messageGroup} ${msg.role === 'human' ? styles.userMessage : styles.botMessage}`}>
              <div className={styles.messageWrapper}>
                <div className={styles.avatar}>
                  {msg.role === "human" ? "👤" : "🤖"}
                </div>
                <div className={styles.message}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.input}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows="1"
            />
            <button 
              className={styles.sendButton} 
              onClick={sendMessage}
              disabled={!message.trim()}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
