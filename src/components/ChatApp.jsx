import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Send, Users, Hash, Plus, Menu } from "lucide-react";

// ✅ Connect to backend socket
const socket = io("https://chatbackendd-3.onrender.com");

const ChatApp = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userID, setUserID] = useState(null);
  const [showGroups, setShowGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null); // ✅ track active group

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

  // ✅ Load userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserID(storedUserId);
  }, []);

  // ✅ Fetch groups from API
  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        "https://chatbackendd-3.onrender.com/user/group"
      );
      const fetchedGroups = Array.isArray(res.data.groups)
        ? res.data.groups
        : Array.isArray(res.data.group)
        ? res.data.group
        : [];

      const formattedGroups = fetchedGroups.map((g) => ({
        ...g,
        active: false,
        unread: g.unread || 0,
        icon: "#",
        name: g.chatTitle || g.name || "Untitled",
      }));

      setGroups(formattedGroups);

      if (formattedGroups.length > 0) {
        const firstGroup = formattedGroups[0];
        setActiveGroup(firstGroup);
        setGroups((prev) =>
          prev.map((g, i) => ({ ...g, active: i === 0 }))
        );
        await fetchChats(firstGroup.id); // ✅ fetch chats for first group
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // ✅ Fetch chats for a group
  const fetchChats = async (groupId) => {
    try {
      const res = await axios.get(
        `https://chatbackendd-3.onrender.com/user/chat?groupID=${groupId}`
      );
      if (res.data && Array.isArray(res.data.chats)) {
        setMessages(res.data.chats);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("❌ Error fetching chats:", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ✅ Listen for new messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (activeGroup && msg.groupID === activeGroup.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("receive_message");
  }, [activeGroup]);

  // ✅ Send message to active group
  const sendMessage = async () => {
    if (!currentMessage.trim() || !userID || !activeGroup) return;
    try {
      const res = await axios.post(
        "https://chatbackendd-3.onrender.com/user/chat",
        {
          userID,
          message: currentMessage,
          receiverID: activeGroup.id,
          groupID: activeGroup.id,
        }
      );
      if (res.data.status === "success") setCurrentMessage("");
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

  // ✅ Set active group on click
  const handleGroupClick = async (index) => {
    const selectedGroup = groups[index];
    setGroups((prev) => prev.map((g, i) => ({ ...g, active: i === index })));
    setActiveGroup(selectedGroup);
    await fetchChats(selectedGroup.id); // ✅ load chats for clicked group
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* --- Banner --- */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-10 px-6 text-white relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">🚀</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                Premium Chat Experience - 50% OFF!
              </h2>
              <p className="text-base md:text-lg opacity-90">
                Unlock unlimited features, custom themes, and priority support
              </p>
            </div>
          </div>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl text-lg">
            Upgrade Now
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* --- Left Sidebar: Users --- */}
        <div className="hidden md:block w-64 bg-slate-800/80 backdrop-blur-xl border-r border-purple-500/20">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Online Users ({users.filter((u) => u.status === "online").length})
            </h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto h-full">
            {users.map((user, i) => (
              <div
                key={i}
                className="flex items-center p-3 rounded-lg hover:bg-slate-700/50"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    {user.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(
                      user.status
                    )}`}
                  ></div>
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Chat Main --- */}
        <div className="flex-1 flex flex-col bg-slate-900/50">
          {/* Header */}
          <div className="p-4 bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Hash className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg md:text-xl font-bold text-white">
                {activeGroup?.name || "general"}
              </h2>
              <span className="hidden md:inline text-gray-400 text-sm">
                Welcome to the main channel!
              </span>
            </div>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-700/50"
              onClick={() => setShowGroups(true)}
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">No messages yet</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg max-w-[80%] ${
                    msg.sender === userID
                      ? "bg-purple-800/40 ml-auto"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">
                        {msg.sender === userID ? "You" : msg.sender}
                      </span>
                      <span className="text-xs text-gray-400">
                        {msg.chat_at}
                      </span>
                    </div>
                    <p className="text-gray-200">{msg.chat}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-800/50 border-t border-purple-500/20">
            <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3 border border-purple-500/20">
              <Plus className="w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* --- Right Sidebar: Groups --- */}
        <div className="hidden md:block w-64 bg-slate-800/80 backdrop-blur-xl border-l border-purple-500/20">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-400" /> Chat Groups
            </h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto">
            {groups.length === 0 ? (
              <p className="text-gray-400 text-center mt-4">
                No groups available
              </p>
            ) : (
              groups.map((group, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                    group.active
                      ? "bg-purple-600/50 text-white"
                      : "hover:bg-slate-700/50 text-gray-300 hover:text-white"
                  }`}
                  onClick={() => handleGroupClick(i)}
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
