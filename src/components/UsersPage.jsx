import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Edit2,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive, banned
  const [sortBy, setSortBy] = useState("name"); // name, email, date, status
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm);

      const matchesFilter =
        filterStatus === "all" || user.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "date":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://chatbackendd-3.onrender.com/user/allusers"
      );
      const data = await response.json();

      // Enhance users with additional mock data for better visualization
      const enhancedUsers = (data.users || []).map((user) => ({
        ...user,
        status: user.status || (Math.random() > 0.8 ? "inactive" : "active"),
        role: user.role || (Math.random() > 0.9 ? "admin" : "user"),
        lastActive:
          user.lastActive ||
          new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        createdAt:
          user.createdAt ||
          new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        avatar:
          user.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User"
          )}&background=random`,
      }));

      setUsers(enhancedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      showMessage("Error fetching users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleUserAction = async (action, userId) => {
    try {
      setActionLoading(true);

      // Mock API calls - replace with actual endpoints
      switch (action) {
        case "activate":
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, status: "active" } : user
            )
          );
          showMessage("User activated successfully", "success");
          break;
        case "deactivate":
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, status: "inactive" } : user
            )
          );
          showMessage("User deactivated successfully", "success");
          break;
        case "delete":
          setUsers((prev) => prev.filter((user) => user.id !== userId));
          showMessage("User deleted successfully", "success");
          break;
        case "makeAdmin":
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, role: "admin" } : user
            )
          );
          showMessage("User promoted to admin", "success");
          break;
        case "removeAdmin":
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, role: "user" } : user
            )
          );
          showMessage("Admin privileges removed", "success");
          break;
      }
    } catch (err) {
      showMessage(`Error performing ${action}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      setActionLoading(true);

      switch (action) {
        case "activate":
          setUsers((prev) =>
            prev.map((user) =>
              selectedUsers.includes(user.id)
                ? { ...user, status: "active" }
                : user
            )
          );
          showMessage(`${selectedUsers.length} users activated`, "success");
          break;
        case "deactivate":
          setUsers((prev) =>
            prev.map((user) =>
              selectedUsers.includes(user.id)
                ? { ...user, status: "inactive" }
                : user
            )
          );
          showMessage(`${selectedUsers.length} users deactivated`, "success");
          break;
        case "delete":
          setUsers((prev) =>
            prev.filter((user) => !selectedUsers.includes(user.id))
          );
          showMessage(`${selectedUsers.length} users deleted`, "success");
          break;
      }

      setSelectedUsers([]);
    } catch (err) {
      showMessage("Error performing bulk action", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const exportUsers = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Email,Phone,Status,Role,Created At\n" +
      filteredUsers
        .map(
          (user) =>
            `${user.id},"${user.name}","${user.email}","${user.phoneNumber}","${user.status}","${user.role}","${user.createdAt}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <UserX className="w-4 h-4 text-gray-500" />;
      case "banned":
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
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

      if (days > 7) return formatDate(dateString);
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return "Just now";
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage users, permissions, and account settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportUsers}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
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

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm disabled:opacity-50"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No users available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(
                              filteredUsers.map((user) => user.id)
                            );
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        checked={
                          selectedUsers.length === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers((prev) => [...prev, user.id]);
                            } else {
                              setSelectedUsers((prev) =>
                                prev.filter((id) => id !== user.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{user.email || "No email"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{user.phoneNumber || "No phone"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{getTimeAgo(user.lastActive)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <div className="relative group">
                            <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                {user.status === "active" ? (
                                  <button
                                    onClick={() =>
                                      handleUserAction("deactivate", user.id)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Deactivate User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleUserAction("activate", user.id)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Activate User
                                  </button>
                                )}

                                {user.role === "admin" ? (
                                  <button
                                    onClick={() =>
                                      handleUserAction("removeAdmin", user.id)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Remove Admin
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleUserAction("makeAdmin", user.id)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Make Admin
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    handleUserAction("delete", user.id)
                                  }
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  Delete User
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    User Details
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedUser.name}
                      </h3>
                      <p className="text-gray-600">ID: {selectedUser.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedUser.email || "No email"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedUser.phoneNumber || "No phone"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Account Status
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              selectedUser.status
                            )}`}
                          >
                            {getStatusIcon(selectedUser.status)}
                            {selectedUser.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Role:</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedUser.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedUser.role === "admin" ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <Shield className="w-3 h-3" />
                            )}
                            {selectedUser.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Activity
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Created: {formatDate(selectedUser.createdAt)}</div>
                      <div>
                        Last Active: {getTimeAgo(selectedUser.lastActive)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
