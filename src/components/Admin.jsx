import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { link } from "./link";
import {
  Bell,
  Search,
  Settings,
  User,
  ChevronDown,
  Moon,
  Sun,
  Maximize,
  Menu,
  X,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New user registered", time: "5 min ago", unread: true },
    { id: 2, message: "Post reported", time: "1 hour ago", unread: true },
    {
      id: 3,
      message: "System backup completed",
      time: "2 hours ago",
      unread: false,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/admin/dashboard":
        return "Dashboard Overview";
      case "/admin/posts":
        return "Posts Management";
      case "/admin/groups":
        return "Groups Management";
      case "/admin/users":
        return "User Management";
      case "/admin/analytics":
        return "Analytics & Reports";
      case "/admin/moderation":
        return "Content Moderation";
      case "/admin/settings":
        return "System Settings";
      default:
        return "Admin Panel";
    }
  };

  // Get breadcrumbs from current route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: "/" + segments.slice(0, index + 1).join("/"),
      isLast: index === segments.length - 1,
    }));
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => n.unread).length;

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header
            className={`border-b transition-colors ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } px-4 py-4`}
          >
            <div className="flex items-center justify-between">
              {/* Left Section - Page Title & Breadcrumbs */}
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                <div>
                  <h1
                    className={`text-xl md:text-2xl font-bold transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {getPageTitle()}
                  </h1>

                  {/* Breadcrumbs */}
                  <nav className="flex items-center gap-2 text-sm mt-1">
                    {getBreadcrumbs().map((crumb, index) => (
                      <React.Fragment key={crumb.path}>
                        <span
                          className={`transition-colors ${
                            crumb.isLast
                              ? isDarkMode
                                ? "text-blue-400"
                                : "text-blue-600"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {crumb.name}
                        </span>
                        {!crumb.isLast && (
                          <span className={`text-gray-400 dark:text-gray-500`}>
                            /
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Right Section - Search, Actions, Profile */}
              <div className="flex items-center gap-3">
                {/* Search Bar - Hidden on mobile */}
                <div className="hidden md:block relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`pl-10 pr-4 py-2 w-64 rounded-lg border transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none`}
                  />
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                {/* Notifications */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div
                      className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg border transition-colors ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      } z-50`}
                    >
                      <div
                        className={`p-4 border-b transition-colors ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <h3
                          className={`font-semibold transition-colors ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b last:border-b-0 transition-colors ${
                              isDarkMode
                                ? "border-gray-700 hover:bg-gray-700"
                                : "border-gray-100 hover:bg-gray-50"
                            } ${
                              notification.unread
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p
                                  className={`text-sm transition-colors ${
                                    isDarkMode
                                      ? "text-gray-200"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                <p
                                  className={`text-xs mt-1 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {notification.time}
                                </p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        className={`p-3 text-center border-t transition-colors ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <button
                          className={`text-sm transition-colors ${
                            isDarkMode
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-700"
                          }`}
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* User Profile Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`hidden md:block text-sm font-medium transition-colors ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Admin User
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div
                      className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border transition-colors ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      } z-50`}
                    >
                      <div className="py-1">
                        <button
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Profile Settings
                        </button>
                        <button
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Account Settings
                        </button>
                        <div
                          className={`border-t my-1 transition-colors ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        ></div>
                        <button
                          className={`w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="h-full">
              <Outlet /> {/* nested route pages appear here */}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 z-50 md:hidden shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navigation
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-4">
              <Sidebar mobile />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLayout;
