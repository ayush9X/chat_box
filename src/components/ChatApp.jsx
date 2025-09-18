import React, { useEffect, useState, useRef } from "react";
import { Send, Users, Hash, Plus, Menu, Wifi, WifiOff } from "lucide-react";

// Mock link for demonstration
const link = "https://chatbackendd-3.onrender.com";

// Import socket.io-client from CDN
const script = document.createElement("script");
script.src =
  "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js";
script.async = true;

script.onload = () => {
  if (window.io) {
    socket = window.io("https://chatbackendd-3.onrender.com", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("🔌 Connected to server via Socket.IO");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠ Socket connection error:", err);
    });
  }
};

document.head.appendChild(script);

// Global socket reference
let socket = null;

const ChatApp = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userID, setUserID] = useState(null);
  const [username, setUsername] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const tempUserId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setUserID(tempUserId);
    setUsername(`User_${Math.random().toString(36).substr(2, 5)}`);
    console.log("🆔 Generated User ID:", tempUserId);
  }, []);

  useEffect(() => {
    const setupSocketListeners = () => {
      if (!socket) return;

      const handleConnect = () => {
        console.log("🔌 Socket connected:", socket.id);
        setIsConnected(true);

        if (pendingMessages.length > 0) {
          console.log("📤 Sending pending messages:", pendingMessages.length);
          pendingMessages.forEach((msg) => {
            sendMessageToServer(msg.message, msg.groupID);
          });
          setPendingMessages([]);
        }
      };

      const handleDisconnect = (reason) => {
        console.log("🔌 Socket disconnected:", reason);
        setIsConnected(false);
      };

      const handleConnectError = (error) => {
        console.error("🔌 Socket connection error:", error);
        setIsConnected(false);
      };

      const handleReconnect = (attemptNumber) => {
        console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
        setIsConnected(true);
      };

      const handleReconnectAttempt = (attemptNumber) => {
        console.log("🔄 Attempting to reconnect...", attemptNumber);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
      socket.on("reconnect", handleReconnect);
      socket.on("reconnect_attempt", handleReconnectAttempt);

      setIsConnected(socket.connected);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        socket.off("reconnect", handleReconnect);
        socket.off("reconnect_attempt", handleReconnectAttempt);
      };
    };

    const checkSocket = () => {
      if (socket) {
        return setupSocketListeners();
      } else {
        setTimeout(checkSocket, 500);
      }
    };

    checkSocket();
  }, [pendingMessages]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${link}/user/group`);
      const data = await response.json();

      const fetchedGroups = Array.isArray(data.groups)
        ? data.groups
        : Array.isArray(data.group)
        ? data.group
        : [];

      const formattedGroups = fetchedGroups.map((g) => ({
        ...g,
        active: false,
        unread: g.unread || 0,
        icon: "#",
        name: g.chatTitle || g.name || "Untitled",
      }));

      setGroups(formattedGroups);

      if (formattedGroups.length > 0 && !activeGroup) {
        const firstGroup = formattedGroups[0];
        setActiveGroup(firstGroup);
        setGroups((prev) => prev.map((g, i) => ({ ...g, active: i === 0 })));
        await fetchChats(firstGroup.id);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      const demoGroups = [
        { id: "1", name: "General", icon: "#", active: true, unread: 0 },
        { id: "2", name: "Random", icon: "#", active: false, unread: 2 },
        { id: "3", name: "Tech Talk", icon: "#", active: false, unread: 0 },
      ];
      setGroups(demoGroups);
      setActiveGroup(demoGroups[0]);
    }
  };

  const fetchChats = async (groupId) => {
    try {
      console.log(`📥 Fetching chats from API for group: ${groupId}`);
      const response = await fetch(`${link}/user/chat?groupID=${groupId}`);
      const data = await response.json();

      if (data && Array.isArray(data.chats)) {
        const sortedChats = [...data.chats].sort(
          (a, b) => new Date(a.chat_at) - new Date(b.chat_at)
        );
        setMessages(sortedChats);
        console.log(`✅ Loaded ${sortedChats.length} messages from API`);
      } else {
        setMessages([]);
        console.log("📝 No messages found for this group");
      }
    } catch (err) {
      console.error("❌ Error fetching chats:", err);
      const demoMessages = [
        {
          sender: "user_demo_1",
          chat: "Welcome to the chat!",
          chat_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          sender: "user_demo_2",
          chat: "Thanks! This looks great.",
          chat_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      setMessages(demoMessages);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!activeGroup || !socket) return;

    const room = `group_${activeGroup.id}`;
    console.log(`🏠 Joining room: ${room}`);
    socket.emit("join", { room });

    const handleMessage = (msg) => {
      console.log("📨 Real-time message received:", msg);
      console.log(typeof msg.sender, msg.sender);

      if (String(msg.sender) == String(username)) {
        console.log("⏩ Skipping my own echoed message");
        return;
      }

      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      console.log(`🚪 Leaving room: ${room}`);
      socket.off("receive_message", handleMessage);
      socket.emit("leave", { room });
    };
  }, [activeGroup, socket, userID]);

  const sendMessageToServer = async (message, groupID) => {
    try {
      const response = await fetch(
        "https://chatbackendd-3.onrender.com/user/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID,
            groupID: groupID || activeGroup.id,
            message: message,
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Message sent successfully");
        return true;
      } else {
        console.error("Send chat failed:", response.statusText);
        return false;
      }
    } catch (err) {
      console.error("Send chat failed:", err);
      return false;
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !userID || !activeGroup) return;

    const messageData = {
      sender: userID,
      chat: currentMessage.trim(),
      chat_at: new Date().toISOString(),
      groupID: activeGroup.id,
      status: isConnected ? "sending" : "pending",
    };

    setMessages((prev) => [...prev, messageData]);
    const messageText = currentMessage.trim();
    setCurrentMessage("");

    if (isConnected) {
      const success = await sendMessageToServer(messageText, activeGroup.id);
      if (success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.chat === messageData.chat && msg.chat_at === messageData.chat_at
              ? { ...msg, status: "sent" }
              : msg
          )
        );
      } else {
        setPendingMessages((prev) => [
          ...prev,
          {
            message: messageText,
            groupID: activeGroup.id,
            timestamp: Date.now(),
          },
        ]);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.chat === messageData.chat && msg.chat_at === messageData.chat_at
              ? { ...msg, status: "failed" }
              : msg
          )
        );
      }
    } else {
      setPendingMessages((prev) => [
        ...prev,
        {
          message: messageText,
          groupID: activeGroup.id,
          timestamp: Date.now(),
        },
      ]);
      console.log("📤 Message queued for sending when connected");
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

  const handleGroupClick = async (index) => {
    const selectedGroup = groups[index];
    setGroups((prev) => prev.map((g, i) => ({ ...g, active: i === index })));
    setActiveGroup(selectedGroup);

    console.log(`📥 Fetching messages for group: ${selectedGroup.name}`);
    await fetchChats(selectedGroup.id);
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getMessageStatusIcon = (msg) => {
    if (msg.status === "pending") return "🕐";
    if (msg.status === "sending") return "⏳";
    if (msg.status === "failed") return "❌";
    if (msg.status === "sent") return "✓";
    return "";
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Fixed Advertisement Banner - Now visible on all screen sizes */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-4 lg:py-10 px-4 lg:px-6 text-white relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-5">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="text-3xl lg:text-5xl">🚀</div>
            <div>
              <h2 className="text-lg lg:text-2xl xl:text-3xl font-extrabold">
                Premium Chat Experience - 50% OFF!
              </h2>
              <p className="text-sm lg:text-base xl:text-lg opacity-90">
                Unlock unlimited features, custom themes, and priority support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <div
              className={`flex items-center gap-2 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm ${
                isConnected
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-3 h-3 lg:w-4 lg:h-4" />
              ) : (
                <WifiOff className="w-3 h-3 lg:w-4 lg:h-4" />
              )}
              <span className="hidden sm:inline">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
              {pendingMessages.length > 0 && (
                <span className="ml-1 lg:ml-2 bg-yellow-500 text-yellow-900 px-1 lg:px-2 py-0.5 rounded text-xs">
                  {pendingMessages.length}
                </span>
              )}
            </div>
            <button className="bg-white text-purple-600 px-4 lg:px-8 py-2 lg:py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl text-sm lg:text-lg">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Container - Fixed height calculation */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Left Sidebar: Users (Desktop only) */}
        <div className="hidden md:block w-64 bg-slate-800/80 backdrop-blur-xl border-r border-purple-500/20 flex-shrink-0">
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

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-900/50 min-h-0">
          {/* Chat Header - Fixed sticky positioning */}
          <div className="sticky top-0 z-20 p-3 lg:p-4 bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <Hash className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
              <h2 className="text-base lg:text-lg xl:text-xl font-bold text-white">
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
              <Menu className="w-5 h-5 lg:w-6 lg:h-6 text-gray-300" />
            </button>
          </div>

          {/* Messages Container - Proper scrolling */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 flex flex-col min-h-0">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">
                No messages yet. Start the conversation! 💬
              </p>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender === userID;
                return (
                  <div
                    key={`${msg.sender}-${msg.chat_at}-${idx}`}
                    className={`flex items-start gap-3 p-3 rounded-lg max-w-[85%] lg:max-w-[80%] transition-all duration-200 ${
                      isMe
                        ? "bg-purple-800/40 ml-auto flex-row-reverse"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                      👤
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`flex items-center gap-2 mb-1 ${
                          isMe ? "justify-end flex-row-reverse" : ""
                        }`}
                      >
                        <span className="font-semibold text-white text-sm lg:text-base">
                          {isMe ? "You" : msg.sender}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.chat_at)}
                        </span>
                        {isMe && (
                          <span className="text-xs">
                            {getMessageStatusIcon(msg)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200 break-words text-sm lg:text-base">
                        {msg.chat}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box - Fixed at bottom */}
          <div className="sticky bottom-0 bg-slate-800/90 backdrop-blur-xl border-t border-purple-500/20 p-3 lg:p-4 flex-shrink-0">
            <div className="flex items-center gap-2 lg:gap-3 bg-slate-700/50 rounded-xl p-2 lg:p-3 border border-purple-500/20">
              <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected
                    ? "Type your message..."
                    : "Type your message (will send when connected)..."
                }
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm lg:text-base"
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || !userID || !activeGroup}
                className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                  isConnected
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                }`}
                title={
                  isConnected
                    ? "Send message"
                    : "Queue message for sending when connected"
                }
              >
                <Send className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </button>
            </div>

            {!isConnected && (
              <p className="text-yellow-400 text-xs mt-2 text-center">
                You're offline. Messages will be sent when connection is
                restored.
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar: Groups (Desktop) */}
        <div className="hidden md:block w-64 bg-slate-800/80 backdrop-blur-xl border-l border-purple-500/20 flex-shrink-0">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-400" /> Chat Groups
            </h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto h-full">
            {groups.length === 0 ? (
              <p className="text-gray-400 text-center mt-4">
                No groups available
              </p>
            ) : (
              groups.map((group, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
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

        {/* Mobile Groups Drawer */}
        <div
          className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
            showGroups ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowGroups(false)}
          ></div>

          {/* Drawer Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-64 bg-slate-800/95 backdrop-blur-xl border-l border-purple-500/20 shadow-lg transform transition-transform duration-300 ease-in-out
    ${showGroups ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-400" /> Chat Groups
              </h3>
              <button
                className="p-2 rounded-lg hover:bg-slate-700/50 text-white text-lg"
                onClick={() => setShowGroups(false)}
              >
                ✕
              </button>
            </div>

            {/* Groups List */}
            <div className="p-2 space-y-1 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-gray-400 text-center mt-4">
                  No groups available
                </p>
              ) : (
                groups.map((group, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      group.active
                        ? "bg-purple-600/50 text-white"
                        : "hover:bg-slate-700/50 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => {
                      handleGroupClick(i);
                      setShowGroups(false);
                    }}
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
    </div>
  );
};

export default ChatApp;
