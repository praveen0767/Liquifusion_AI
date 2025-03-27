import React, { useState, useEffect } from "react";
import { freelance_backend } from "../../../declarations/freelance_backend";

const Chat = ({ jobId, user }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadChat();
  }, []);

  const loadChat = async () => {
    try {
      const chatHistory = await freelance_backend.get_chat(jobId);
      setMessages(chatHistory);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await freelance_backend.send_message(jobId, user, message, Date.now());
      setMessage("");
      loadChat();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <h3>Chat</h3>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
