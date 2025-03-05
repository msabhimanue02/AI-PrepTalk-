import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Chat.module.css";
import { FaPaperPlane, FaBars, FaSun, FaMoon, FaComment, FaSignOutAlt } from "react-icons/fa";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const chatBoxRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;

    setMessages(prev => [...prev, { text: message }]);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    fetch("http://localhost:5000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages(prev => [...prev, { text: data.response }]);
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={`${styles.page} ${!isDarkTheme ? styles.lightTheme : ''}`}>
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

      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Chat History</h2>
        </div>
        <div className={styles.history}>
          {messages.map((msg, index) => (
            <div key={index} className={styles.historyItem}>
              <FaComment /> {msg.text.substring(0, 30)}...
            </div>
          ))}
        </div>
      </aside>
      
      <main className={styles.mainContent}>
        <div className={styles.chatHeader}>
          <h1 className={styles.chatTitle}>AI-PrepTalk</h1>
        </div>

        <div className={styles.chatBox} ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={styles.messageGroup}
            >
              <div className={styles.messageWrapper}>
                <div className={styles.avatar}>
                  👤
                </div>
                <div className={styles.message}>
                  {msg.text}
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
