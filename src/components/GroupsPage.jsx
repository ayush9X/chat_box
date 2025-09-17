import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  MessageSquare,
  Users,
  Search,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  MoreVertical,
  Filter,
} from "lucide-react";

const GroupsPage = () => {
  const [chatTitle, setChatTitle] = useState("");
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, info
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState("recent"); // recent, name, members

  // Fetch existing groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://chatbackendd-3.onrender.com/user/group"
      );
      console.log("Groups fetched:", res.data);

      const fetchedGroups = Array.isArray(res.data.groups)
        ? res.data.groups
        : Array.isArray(res.data.group)
        ? res.data.group
        : [];

      // Add mock data for better visualization (you can remove this)
      const enhancedGroups = fetchedGroups.map((group) => ({
        ...group,
        memberCount: group.memberCount || Math.floor(Math.random() * 50) + 1,
        createdAt: group.createdAt || new Date().toISOString(),
        lastActivity:
          group.lastActivity ||
          new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
      }));

      setGroups(enhancedGroups);
      setFilteredGroups(enhancedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      showMessage("Error fetching groups", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Filter and sort groups
  useEffect(() => {
    let filtered = groups.filter((group) =>
      (group.chatTitle || group.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    // Sort groups
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.chatTitle || a.title || "").localeCompare(
            b.chatTitle || b.title || ""
          );
        case "members":
          return (b.memberCount || 0) - (a.memberCount || 0);
        case "recent":
        default:
          return (
            new Date(b.lastActivity || b.createdAt) -
            new Date(a.lastActivity || a.createdAt)
          );
      }
    });

    setFilteredGroups(filtered);
  }, [groups, searchTerm, sortBy]);

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // Handle adding a new group
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatTitle.trim()) {
      showMessage("Group title is required!", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://chatbackendd-3.onrender.com/user/group",
        { chatTitle: chatTitle.trim() }
      );

      if (res.data.status === "success") {
        showMessage("Group created successfully!", "success");
        const newGroup = {
          ...res.data.group,
          chatTitle: res.data.group?.chatTitle || chatTitle,
          memberCount: 1,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };
        setGroups((prev) => [newGroup, ...prev]);
        setChatTitle("");
        setShowCreateForm(false);
      } else {
        showMessage("Failed to create group", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Error creating group", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setChatTitle(group.chatTitle || group.title || "");
    setShowCreateForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!chatTitle.trim()) {
      showMessage("Group title is required!", "error");
      return;
    }

    try {
      setLoading(true);
      // Add your update API call here
      // const res = await axios.put(`https://chatbackendd-3.onrender.com/user/group/${editingGroup.id}`, { chatTitle });

      // For now, update locally
      setGroups((prev) =>
        prev.map((group) =>
          group.id === editingGroup.id
            ? { ...group, chatTitle: chatTitle.trim() }
            : group
        )
      );

      showMessage("Group updated successfully!", "success");
      setChatTitle("");
      setEditingGroup(null);
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      showMessage("Error updating group", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId) => {
    try {
      setLoading(true);
      // Add your delete API call here
      // await axios.delete(`https://chatbackendd-3.onrender.com/user/group/${groupId}`);

      // For now, delete locally
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
      showMessage("Group deleted successfully!", "success");
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      showMessage("Error deleting group", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const getTimeAgo = (dateString) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return "Just now";
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                Groups Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage chat groups and their settings
              </p>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingGroup(null);
                setChatTitle("");
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              messageType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : messageType === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : messageType === "error" ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="ml-auto hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingGroup ? "Edit Group" : "Create New Group"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingGroup(null);
                      setChatTitle("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form
                  onSubmit={editingGroup ? handleUpdate : handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter group title..."
                      value={chatTitle}
                      onChange={(e) => setChatTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading
                        ? "Processing..."
                        : editingGroup
                        ? "Update Group"
                        : "Create Group"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingGroup(null);
                        setChatTitle("");
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="recent">Recent Activity</option>
                <option value="name">Name A-Z</option>
                <option value="members">Most Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groups List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                All Groups ({filteredGroups.length})
              </h2>
            </div>
          </div>

          {loading && groups.length === 0 ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading groups...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No groups found" : "No groups yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first group to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setEditingGroup(null);
                    setChatTitle("");
                  }}
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create First Group
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredGroups.map((group, index) => (
                <div
                  key={group.id || index}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {group.chatTitle || group.title || "Untitled Group"}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{group.memberCount || 0} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created {formatDate(group.createdAt)}</span>
                          </div>
                          <div>
                            <span>
                              Last active{" "}
                              {getTimeAgo(
                                group.lastActivity || group.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(group)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit group"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(group)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delete Group
                  </h2>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "
                  <strong>
                    {deleteConfirm.chatTitle || deleteConfirm.title}
                  </strong>
                  "? This action cannot be undone and all messages will be
                  permanently lost.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? "Deleting..." : "Delete Group"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
