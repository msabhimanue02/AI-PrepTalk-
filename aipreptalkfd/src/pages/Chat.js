import React, { useState } from "react";
import "../styles/Chat.css";
import { FaHistory, FaMoon, FaSun, FaExpand, FaCompress } from "react-icons/fa";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: "user" }, { text: "This is a bot response.", sender: "bot" }]);
    setInput("");
  };

  return (
    <div className={`chat-container ${darkMode ? "dark" : ""} ${isFullScreen ? "fullscreen" : ""}`}>
      <div className="chat-box">
        <div className="top-bar">
          <div className="left-icons">
            <FaHistory onClick={() => setHistoryOpen(!historyOpen)} />
            {darkMode ? <FaSun onClick={() => setDarkMode(false)} /> : <FaMoon onClick={() => setDarkMode(true)} />}
          </div>
          <h1 className="title">AI PrepTalk</h1>
          <div className="right-icons">
            {isFullScreen ? (
              <FaCompress onClick={() => setIsFullScreen(false)} />
            ) : (
              <FaExpand onClick={() => setIsFullScreen(true)} />
            )}
          </div>
        </div>

        <div className="chat-content">
          <div className={`history-panel ${historyOpen ? "open" : ""}`}>
            <h3>Chat History</h3>
            <ul>
              <li>Mock Interview 1</li>
              <li>Mock Interview 2</li>
              <li>Mock Interview 3</li>
            </ul>
          </div>

          <div className="chat-area">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
