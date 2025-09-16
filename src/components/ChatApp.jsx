import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  Send,
  Users,
  Hash,
  Settings,
  Bell,
  Search,
  Plus,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

// ✅ Connect to backend socket
const socket = io("https://wzl6mwg3-5000.inc1.devtunnels.ms");

const ChatApp = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userID, setUserID] = useState(null);

  const [users] = useState([
    {
      name: "Alex Chen",
      avatar: "🦸",
      status: "online",
      activity: "Designing",
    },
    {
      name: "Sarah Miller",
      avatar: "👩‍💻",
      status: "online",
      activity: "Coding",
    },
    { name: "Mike Johnson", avatar: "🎨", status: "away", activity: "Away" },
    {
      name: "Emma Davis",
      avatar: "🌟",
      status: "online",
      activity: "Streaming",
    },
    {
      name: "David Wilson",
      avatar: "🎵",
      status: "dnd",
      activity: "Do Not Disturb",
    },
    {
      name: "Lisa Zhang",
      avatar: "📚",
      status: "offline",
      activity: "Last seen 2h ago",
    },
  ]);

  const [groups] = useState([
    { name: "general", icon: "💬", active: true, unread: 0 },
    { name: "design-team", icon: "🎨", active: false, unread: 3 },
    { name: "random", icon: "🎲", active: false, unread: 1 },
    { name: "music-lounge", icon: "🎵", active: false, unread: 0 },
    { name: "gaming", icon: "🎮", active: false, unread: 7 },
  ]);

  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  // ✅ Load userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserID(storedUserId);
    } else {
      console.warn("⚠️ No userId found in localStorage. Please login first.");
    }
  }, []);

  // ✅ Listen for new messages from backend
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("receive_message");
    };
  }, []);

  // ✅ Send message to backend
  const sendMessage = async () => {
    if (!currentMessage.trim() || !userID) return;

    try {
      const res = await axios.post(
        "https://wzl6mwg3-5000.inc1.devtunnels.ms/user/chat",
        {
          userID: userID,
          message: currentMessage,
          receiverID: "all",
        }
      );

      if (res.data.status === "success") {
        setCurrentMessage("");
      }
    } catch (err) {
      console.error("❌ Error sending chat:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "away":
        return "bg-yellow-400";
      case "dnd":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* --- Banner --- */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🚀</div>
            <div>
              <h2 className="text-lg font-bold">
                Premium Chat Experience - 50% OFF!
              </h2>
              <p className="text-sm opacity-90">
                Unlock unlimited features, custom themes, and priority support
              </p>
            </div>
          </div>
          <button className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            Upgrade Now
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- Left Sidebar: Users --- */}
        <div className="w-64 bg-slate-800/80 backdrop-blur-xl border-r border-purple-500/20">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Online Users ({users.filter((u) => u.status === "online").length})
            </h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto h-full">
            {users.map((user, index) => (
              <div
                key={index}
                className="flex items-center p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg">
                    {user.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(
                      user.status
                    )}`}
                  ></div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-white font-medium group-hover:text-purple-300 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400">{user.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Chat Main --- */}
        <div className="flex-1 flex flex-col bg-slate-900/50">
          {/* Header */}
          <div className="p-4 bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">general</h2>
                <span className="text-gray-400 text-sm">
                  Welcome to the main channel!
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-all">
                  <Bell className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-all">
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                  msg.sender === userID
                    ? "bg-purple-800/40 ml-auto"
                    : "hover:bg-slate-800/30"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                  👤
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">
                      {msg.sender === userID ? "You" : msg.sender}
                    </span>
                    <span className="text-xs text-gray-400">{msg.chat_at}</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{msg.chat}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-800/50 backdrop-blur-xl border-t border-purple-500/20">
            <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3 border border-purple-500/20">
              <Plus className="w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* --- Right Sidebar: Groups --- */}
        <div className="w-64 bg-slate-800/80 backdrop-blur-xl border-l border-purple-500/20">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-400" />
              Chat Groups
            </h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto">
            {groups.map((group, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  group.active
                    ? "bg-purple-600/50 text-white"
                    : "hover:bg-slate-700/50 text-gray-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{group.icon}</span>
                  <span className="font-medium">{group.name}</span>
                </div>
                {group.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {group.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
