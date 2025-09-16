// GroupsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupsPage = () => {
  const [chatTitle, setChatTitle] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing groups
  const fetchGroups = async () => {
    try {
      const res = await axios.get("https://chatbackendd-3.onrender.com/user/group");
      console.log("Groups fetched:", res.data);
      // Assuming API returns an array of groups in res.data.groups or res.data.group
      const fetchedGroups = Array.isArray(res.data.groups)
        ? res.data.groups
        : Array.isArray(res.data.group)
        ? res.data.group
        : [];
      setGroups(fetchedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Handle adding a new group
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatTitle) {
      setMessage("Group title is required!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://chatbackendd-3.onrender.com/user/group",
        { chatTitle }
      );

      if (res.data.status === "success") {
        setMessage("Group created successfully!");
        setGroups((prev) => [res.data.group || { chatTitle }, ...prev]); // add new group to list
        setChatTitle("");
      } else {
        setMessage("Failed to create group");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error creating group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Create Group</h1>
      {message && <p>{message}</p>}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Group Title"
          value={chatTitle}
          onChange={(e) => setChatTitle(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>

      <h2>All Groups</h2>
      {groups.length === 0 ? (
        <p>No groups available</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groups.map((group, index) => (
            <li
              key={group.id || index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              {group.chatTitle || group.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupsPage;
