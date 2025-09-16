import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://wzl6mwg3-5000.inc1.devtunnels.ms"); // your backend URL

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userID, setUserID] = useState(null);

  // ✅ Load userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserID(storedUserId);
    } else {
      console.warn("⚠️ No userId found in localStorage. Please login first.");
    }
  }, []);

  // ✅ Listen for new messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // ✅ Send message
  const sendMessage = async () => {
    if (!input.trim() || !userID) return;

    try {
      const res = await axios.post(
        "https://chatbackendd-3.onrender.com/user/chat",
        {
          userID: userID,
          message: input,
          receiverID: "all", // send to all
        }
      );

      if (res.data.status === "success") {
        setInput("");
      }
    } catch (err) {
      console.error("❌ Error sending chat:", err);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Group Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}:</strong> {msg.chat}
            <small style={{ marginLeft: "10px", color: "gray" }}>
              {msg.chat_at}
            </small>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "70%", padding: "8px" }}
      />
      <button onClick={sendMessage} style={{ padding: "8px 15px" }}>
        Send
      </button>
    </div>
  );
}
