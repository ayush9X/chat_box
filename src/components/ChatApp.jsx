import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Send, Users, Hash, Plus, Menu, Wifi, WifiOff } from "lucide-react";
import { link } from "./link";


// ✅ Connect to backend socket
const sendMessageToServer = async (message, groupID) => {
  try {
    const response = await fetch(`${link}/user/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID,
        groupID: groupID || activeGroup.id,
        message: message,
      }),
    });

    if (response.ok) {
      console.log("✅message successfully");
      return true;
    } else {
      console.error("❌ Send chat failed: HTTP", response.status);
      return false;
    }
  } catch (err) {
    console.error("❌ Send chat failed:", err);
    return false;
  }
};

// Import socket.io-client from CDN
const script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js";
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
      console.error("⚠️ Socket connection error:", err);
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

  // Initialize user ID in memory (no localStorage)
  useEffect(() => {
    const tempUserId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setUserID(tempUserId);
    console.log("🆔 Generated User ID:", tempUserId);
  }, []);

  // Enhanced socket connection handling
  useEffect(() => {
    const setupSocketListeners = () => {
      if (!socket) return;

      const handleConnect = () => {
        console.log("🔌 Socket connected:", socket.id);
        setIsConnected(true);
        
        // Send any pending messages when reconnected
        if (pendingMessages.length > 0) {
          console.log("📤 Sending pending messages:", pendingMessages.length);
          pendingMessages.forEach(msg => {
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

      // Initial connection check
      setIsConnected(socket.connected);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        socket.off("reconnect", handleReconnect);
        socket.off("reconnect_attempt", handleReconnectAttempt);
      };
    };

    // Setup listeners when socket is available
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
      // Demo fallback data
      const demoGroups = [
        { id: '1', name: 'General', icon: '#', active: true, unread: 0 },
        { id: '2', name: 'Random', icon: '#', active: false, unread: 2 },
        { id: '3', name: 'Tech Talk', icon: '#', active: false, unread: 0 },
      ];
      setGroups(demoGroups);
      setActiveGroup(demoGroups[0]);
    }
  };

  const fetchChats = async (groupId) => {
    try {
      console.log("📥 Fetching chats from API for group: ${groupId}");
      const response = await fetch(
        `${link}/user/chat?groupID=${groupId}`
      );
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
      // Demo fallback messages
      const demoMessages = [
        {
          sender: 'user_demo_1',
          chat: 'Welcome to the chat!',
          chat_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          sender: 'user_demo_2',
          chat: 'Thanks! This looks great.',
          chat_at: new Date(Date.now() - 1800000).toISOString()
        }
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
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [activeGroup]);

  const sendMessageToServer = async (message, groupID) => {
    try {
      await axios.post(`${link}user/chat`, {
        userID,
        groupID: groupID || activeGroup.id,
        message: message,
      });
      console.log("message success.");
      return true;
    } catch (err) {
      console.error("❌ Send chat failed:", err);
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
      status: isConnected ? 'sending' : 'pending'
    };

    // Add message to UI immediately for better UX
    setMessages(prev => [...prev, messageData]);
    const messageText = currentMessage.trim();
    setCurrentMessage("");

    if (isConnected) {
      // Try to send immediately if connected
      const success = await sendMessageToServer(messageText, activeGroup.id);
      if (success) {
        // Update message status to sent
        setMessages(prev => prev.map(msg => 
          msg.chat === messageData.chat && msg.chat_at === messageData.chat_at 
            ? {...msg, status: 'sent'} 
            : msg
        ));
      } else {
        // If send failed, add to pending queue and update status
        setPendingMessages(prev => [...prev, {
          message: messageText,
          groupID: activeGroup.id,
          timestamp: Date.now()
        }]);
        
        setMessages(prev => prev.map(msg => 
          msg.chat === messageData.chat && msg.chat_at === messageData.chat_at 
            ? {...msg, status: 'failed'} 
            : msg
        ));
      }
    } else {
      // Add to pending queue if not connected
      setPendingMessages(prev => [...prev, {
        message: messageText,
        groupID: activeGroup.id,
        timestamp: Date.now()
      }]);
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

    console.log("📥 Fetching messages for group: ${selectedGroup.name}");
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
    if (msg.status === 'pending') return '🕐';
    if (msg.status === 'sending') return '⏳';
    if (msg.status === 'failed') return '❌';
    if (msg.status === 'sent') return '✓';
    return '';
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isConnected
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              {isConnected ? "Connected" : "Disconnected"}
              {pendingMessages.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded text-xs">
                  {pendingMessages.length} pending
                </span>
              )}
            </div>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl text-lg">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
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

        <div className="flex-1 flex flex-col bg-slate-900/50">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">
                No messages yet. Start the conversation! 💬
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={`${msg.sender}-${msg.chat_at}-${idx}`}
                  className={`flex items-start gap-3 p-3 rounded-lg max-w-[80%] transition-all duration-200 ${
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
                        {formatTime(msg.chat_at)}
                      </span>
                      {msg.sender === userID && (
                        <span className="text-xs">
                          {getMessageStatusIcon(msg)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-200 break-words">{msg.chat}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-800/50 border-t border-purple-500/20">
            <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3 border border-purple-500/20">
              <Plus className="w-6 h-6 text-gray-400" />
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
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || !userID || !activeGroup}
                className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isConnected
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                }`}
                title={isConnected ? "Send message" : "Queue message for sending when connected"}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            {!isConnected && (
              <p className="text-yellow-400 text-xs mt-2 text-center">
                You're offline. Messages will be sent when connection is restored.
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar: Groups */}
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
      </div>
    </div>
  );
};

export default ChatApp;