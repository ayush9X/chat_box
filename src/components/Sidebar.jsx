import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Shield,
  Home,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      path: "/admin/users",
      label: "Dashboard",
      icon: Home,
      color: "text-blue-500",
    },
    {
      path: "/admin/posts",
      label: "Posts",
      icon: FileText,
      color: "text-green-500",
      badge: "12", // You can make this dynamic
    },
    {
      path: "/admin/groups",
      label: "Groups",
      icon: MessageSquare,
      color: "text-purple-500",
    },
  ];

  const isActiveRoute = (path) => location.pathname === path;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b border-gray-200 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800">Admin Panel</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = isActiveRoute(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)} // Close mobile menu on navigation
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
                ${isCollapsed ? "justify-center px-2" : ""}
              `}
            >
              <IconComponent
                className={`w-5 h-5 ${
                  isActive ? "text-blue-600" : item.color
                } flex-shrink-0`}
              />

              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 bg-red-500 px-1.5 py-0.5 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Admin User</p>
              <p className="text-xs">Super Administrator</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`
          hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 shadow-sm
          ${isCollapsed ? "w-16" : "w-64"}
        `}
        style={{ height: "100vh" }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-full bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 md:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ width: "280px" }}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
