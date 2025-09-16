// Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation(); // for active tab highlighting

  return (
    <div style={{ width: "200px", background: "#f0f0f0", padding: "20px" }}>
      <Link
        to="/admin/posts"
        style={{
          display: "block",
          marginBottom: "10px",
          fontWeight: location.pathname === "/admin/posts" ? "bold" : "normal",
        }}
      >
        Posts
      </Link>
      <Link
        to="/admin/groups"
        style={{
          display: "block",
          marginBottom: "10px",
          fontWeight: location.pathname === "/admin/groups" ? "bold" : "normal",
        }}
      >
        Groups
      </Link>
      <Link
        to="/admin/users"
        style={{
          display: "block",
          marginBottom: "10px",
          fontWeight: location.pathname === "/admin/users" ? "bold" : "normal",
        }}
      >
        Users
      </Link>
    </div>
  );
};

export default Sidebar;
