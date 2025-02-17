import React, { useState } from "react";
import "../styles/Chat.css";
import { FaPaperPlane, FaBars } from "react-icons/fa";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);


  const sendMessage = () => {
    if (message.trim() === "") return;

    const userMessage = { sender: "user", text: message };
    setChat([...chat, userMessage]);
    setMessage("");

    fetch("http://localhost:5000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then((response) => response.json())
      .then((data) => {
        setChat((prevChat) => [...prevChat, { sender: "bot", text: data.response }]);
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className={`chat-container }`}>
      <aside className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
        <button className="toggle-sidebar" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
          <FaBars />
        </button>
        {sidebarExpanded && <p className="history">History</p>}
      </aside>
      <main className="chat-main">
        <div className="chat-header">
          <h2>AI-PrepTalk</h2>

        </div>
        <div className="chat-box">
          {chat.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>{msg.text}</div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
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
