import React, { useState } from "react";
import "../styles/Chat.css";
import { FaPaperPlane, FaBars, FaSun, FaMoon } from "react-icons/fa";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { text: input, sender: "user" }, { text: "AI Response...", sender: "ai" }]);
    setInput("");
  };

  return (
    <div className={`chat-container ${darkMode ? "dark" : "light"}`}>
      <aside className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
        <button className="toggle-sidebar" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
          <FaBars />
        </button>
        {sidebarExpanded && <p className="history">History</p>}
      </aside>
      <main className="chat-main">
        <div className="chat-header">
          <h1 className="title">AI-PrepTalk</h1>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>{msg.text}</div>
          ))}
        </div>
        <div className="input-container">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Send a message..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
          />
          <button className="send-button" onClick={sendMessage}>
            <FaPaperPlane />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Chat;
