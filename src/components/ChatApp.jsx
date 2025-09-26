const toggleMobileAd = () => {
  console.log("Toggle button clicked!", {
    showMobileAd,
    adPermanentlyHidden,
    showAdToggle,
  });

  if (adPermanentlyHidden && showAdToggle) {
    // Restore the ad and reset to original behavior
    console.log("Restoring ads and resetting scroll behavior...");
    setShowMobileAd(true);
    setAdPermanentlyHidden(false);
    setShowAdToggle(false);
    // Reset scroll tracking
    lastScrollTop.current = 0;
  } else if (!adPermanentlyHidden && showMobileAd) {
    // Hide the ad manually
    console.log("Hiding ads manually...");
    setShowMobileAd(false);
    setAdPermanentlyHidden(true);
    setShowAdToggle(true);
  }
};
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Send, Users, Hash, Plus, Menu, Wifi, WifiOff } from "lucide-react";

// Mock link for demonstration
const link = "https://www.joinchat.in";

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
  const [socket, setSocket] = useState(null);

  // Mobile ad sliding states
  const [showMobileAd, setShowMobileAd] = useState(true);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [adPermanentlyHidden, setAdPermanentlyHidden] = useState(false);
  const [showAdToggle, setShowAdToggle] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastScrollTop = useRef(0);

  // ✅ Paste toggleMobileAd here
  const toggleMobileAd = () => {
    console.log("Toggle button clicked!", {
      showMobileAd,
      adPermanentlyHidden,
      showAdToggle,
    });

    if (adPermanentlyHidden && showAdToggle) {
      // Restore the ad and reset to original behavior
      console.log("Restoring ads and resetting scroll behavior...");
      setShowMobileAd(true);
      setAdPermanentlyHidden(false);
      setShowAdToggle(false);
      // Reset scroll tracking
      lastScrollTop.current = 0;
    } else if (!adPermanentlyHidden && showMobileAd) {
      // Hide the ad manually
      console.log("Hiding ads manually...");
      setShowMobileAd(false);
      setAdPermanentlyHidden(true);
      setShowAdToggle(true);
    }
  };

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

  // Handle scroll for mobile ad visibility - Hide permanently on first upward scroll
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const currentScrollTop = messagesContainer.scrollTop;

      // Only process scroll events if ad is not permanently hidden
      if (!adPermanentlyHidden) {
        if (currentScrollTop < lastScrollTop.current && currentScrollTop > 0) {
          // Scrolling up - hide ad permanently
          if (scrollDirection !== "up") {
            setScrollDirection("up");
            setShowMobileAd(false);
            setAdPermanentlyHidden(true);
            setShowAdToggle(true);
            console.log("Ads hidden by scroll up");
          }
        } else if (
          currentScrollTop > lastScrollTop.current &&
          currentScrollTop > 10
        ) {
          // Scrolling down - only update direction, keep ad visible if not permanently hidden
          if (scrollDirection !== "down") {
            setScrollDirection("down");
          }
        }
      }

      lastScrollTop.current = currentScrollTop;
    };

    messagesContainer.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      messagesContainer.removeEventListener("scroll", handleScroll);
    };
  }, [scrollDirection, adPermanentlyHidden]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize user
  useEffect(() => {
    const storedUserId = "7";
    const storedUsername = `User${storedUserId}`;

    setUserID(storedUserId);
    setUsername(storedUsername);

    console.log("🆔 User ID:", storedUserId);
    console.log("👤 Username:", storedUsername);
  }, []);

  // Initialize Socket.IO with better error handling
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Load Socket.IO dynamically
        if (!window.io) {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js";
          script.async = true;

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (window.io && !socketRef.current) {
          const newSocket = window.io(link, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            timeout: 10000,
          });

          socketRef.current = newSocket;
          setSocket(newSocket);

          newSocket.on("connect", () => {
            console.log("🔌 Connected to server via Socket.IO");
            setIsConnected(true);
          });

          newSocket.on("disconnect", (reason) => {
            console.log("🔌 Socket disconnected:", reason);
            setIsConnected(false);
          });

          newSocket.on("connect_error", (error) => {
            console.warn("⚠️ Socket connection error - working in demo mode");
            setIsConnected(false);
          });

          newSocket.on("reconnect", (attemptNumber) => {
            console.log(
              "🔄 Socket reconnected after",
              attemptNumber,
              "attempts"
            );
            setIsConnected(true);
          });

          // Set demo connection after a delay if server is not available
          setTimeout(() => {
            if (!newSocket.connected) {
              console.log("📱 Working in demo mode - server not available");
              setIsConnected(false);
            }
          }, 5000);
        }
      } catch (error) {
        console.warn("⚠️ Socket.IO not available - working in demo mode");
        setIsConnected(false);
      }
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Handle pending messages when connected
  useEffect(() => {
    if (isConnected && pendingMessages.length > 0 && socket) {
      console.log("📤 Sending pending messages:", pendingMessages.length);
      pendingMessages.forEach((msg) => {
        sendMessageToServer(msg.message, msg.groupID);
      });
      setPendingMessages([]);
    }
  }, [isConnected, pendingMessages, socket]);

  const fetchGroups = async () => {
    try {
      console.log(`🔍 Attempting to fetch groups from: ${link}/user/group`);
      const response = await fetch(`${link}/user/group`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      });

      console.log(`📡 Server response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Groups data received:", data);

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
      console.error(`❌ Error fetching groups from ${link}:`, err.message);
      console.warn("⚠️ Server not available, using demo data");
      const demoGroups = [
        { id: "1", name: "General", icon: "#", active: true, unread: 0 },
        { id: "2", name: "Random", icon: "#", active: false, unread: 2 },
        { id: "3", name: "Tech Talk", icon: "#", active: false, unread: 0 },
        { id: "4", name: "Support", icon: "#", active: false, unread: 1 },
      ];
      setGroups(demoGroups);
      setActiveGroup(demoGroups[0]);
      // Load demo messages for the first group
      await fetchChats(demoGroups[0].id);
    }
  };

  const fetchChats = async (groupId) => {
    try {
      console.log(
        `📥 Fetching chats from: ${link}/user/chat?groupID=${groupId}`
      );
      const response = await fetch(`${link}/user/chat?groupID=${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      });

      console.log(`📡 Chat response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("💬 Chat data received:", data);

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
      console.error(`❌ Error fetching chats from ${link}:`, err.message);
      console.warn("⚠️ Server not available, loading demo messages");
      const demoMessages = [
        {
          sender: "user_1",
          chat: "Welcome to the chat! 🎉",
          chat_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          sender: "user_2",
          chat: "Thanks! This chat app looks amazing.",
          chat_at: new Date(Date.now() - 3000000).toISOString(),
        },
        {
          sender: "7",
          chat: "Hello everyone! Great to be here.",
          chat_at: new Date(Date.now() - 2400000).toISOString(),
        },
        {
          sender: "user_3",
          chat: "Has anyone tried the premium features?",
          chat_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          sender: "user_1",
          chat: "Yes! The themes are really nice 👌",
          chat_at: new Date(Date.now() - 1200000).toISOString(),
        },
        {
          sender: "7",
          chat: "I'm thinking about upgrading too",
          chat_at: new Date(Date.now() - 600000).toISOString(),
        },
        {
          sender: "user_4",
          chat: "The mobile experience is fantastic!",
          chat_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          sender: "7",
          chat: "Absolutely! The animations are so smooth.",
          chat_at: new Date(Date.now() - 240000).toISOString(),
        },
        {
          sender: "user_2",
          chat: "I love how responsive everything feels.",
          chat_at: new Date(Date.now() - 180000).toISOString(),
        },
        {
          sender: "user_5",
          chat: "The design is really modern and clean.",
          chat_at: new Date(Date.now() - 120000).toISOString(),
        },
        {
          sender: "7",
          chat: "Try scrolling up to see the cool ad animations!",
          chat_at: new Date(Date.now() - 60000).toISOString(),
        },
        {
          sender: "user_1",
          chat: "Wow, that's a neat feature! Very polished.",
          chat_at: new Date(Date.now() - 30000).toISOString(),
        },
      ];
      setMessages(demoMessages);
      console.log("📝 Loaded demo messages for offline mode");
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

      // ✅ Normalize keys (backend sends {userID, message}, UI expects {sender, chat})
      const formattedMsg = {
        sender: msg.sender,
        chat: msg.message || msg.chat,
        chat_at: msg.chat_at || new Date().toISOString(),
        groupID: msg.groupID,
        status: "sent",
      };

      // ✅ Skip my own messages
      if (String(formattedMsg.sender) === String(username)) {
        console.log("⏩ Skipping my own echoed message");
        return;
      }

      setMessages((prev) => [...prev, formattedMsg]);
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
        console.log("✅ Message sent successfully");
        return true;
      } else {
        console.warn("⚠️ Server error, message will work in demo mode");
        return true; // Return true for demo mode
      }
    } catch (err) {
      console.warn("⚠️ Server not available, message added locally");
      return true; // Return true for demo mode
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
    <div
      className={`h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden transition-all duration-500 ease-in-out ${
        !showMobileAd ? "md:h-screen" : ""
      }`}
    >
      {/* Fixed Advertisement Banner - Desktop Only */}
      <div className="hidden md:block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-4 lg:py-6 px-4 lg:px-6 text-white relative flex-shrink-0">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-5">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="text-2xl lg:text-4xl">🚀</div>
            <div>
              <h2 className="text-lg lg:text-xl xl:text-2xl font-extrabold">
                Join Chat - 50% OFF!
              </h2>
              <p className="text-sm lg:text-base opacity-90">
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
            <a
              href="https://t.me/+4aszd823mslmMjBl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-white text-purple-600 px-3 lg:px-6 py-1.5 lg:py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg text-sm lg:text-base">
                Join Group
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Ad Toggle Button - Shows when ad is hidden */}
      {showAdToggle && adPermanentlyHidden && (
        <div className="md:hidden fixed top-2 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <button
            onClick={toggleMobileAd}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-semibold flex items-center gap-2 border border-white/20"
          >
            <span>📢</span>
            Restore Ads
            <span className="text-xs opacity-75">🔄</span>
          </button>
        </div>
      )}

      {/* Mobile Advertisement Section with One-Time Hide Animation */}
      <div
        className={`md:hidden bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/20 transition-all duration-500 ease-in-out transform ${
          showMobileAd && !adPermanentlyHidden
            ? "translate-y-0 opacity-100 flex-shrink-0 relative"
            : "-translate-y-full opacity-0 absolute top-0 left-0 right-0 z-10 pointer-events-none"
        }`}
      >
        <div className="p-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
              🚀 Advertisement
            </h3>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isConnected
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span>{isConnected ? "Online" : "Offline"}</span>
              {pendingMessages.length > 0 && (
                <span className="ml-1 bg-yellow-500 text-yellow-900 px-1 py-0.5 rounded text-xs">
                  {pendingMessages.length}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="p-3 flex gap-3 overflow-x-auto">
          {/* Horizontal scrolling ads for mobile */}
          <div className="flex-shrink-0 w-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 text-white shadow-lg">
            <div className="text-xl mb-1">🔥</div>
            <h4 className="font-bold text-sm mb-1">Special Offer</h4>
            <p className="text-xs opacity-90 mb-2">
              Get 70% OFF on premium chat themes!
            </p>
            <a
              href="https://t.me/+4aszd823mslmMjBl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-white text-purple-600 px-2 py-1 rounded-full font-bold text-xs hover:bg-gray-100 transition-all shadow-md">
                Grab Now
              </button>
            </a>
          </div>

          <div className="flex-shrink-0 w-48 bg-slate-700/50 rounded-lg p-3 text-gray-200 shadow-md">
            <div className="text-lg mb-1">📢</div>
            <h4 className="font-bold text-xs mb-1">Sponsored</h4>
            <p className="text-xs opacity-80 mb-2">
              Join our Telegram group for exclusive deals and updates.
            </p>
            <a
              href="https://t.me/+4aszd823mslmMjBl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full font-semibold text-xs hover:opacity-90 transition-all">
                Join Now
              </button>
            </a>
          </div>

          <div className="flex-shrink-0 w-48 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-3 text-white shadow-lg">
            <div className="text-xl mb-1">💎</div>
            <h4 className="font-bold text-sm mb-1">Premium</h4>
            <p className="text-xs opacity-90 mb-2">
              Unlock all features and get priority support!
            </p>
            <a
              href="https://t.me/+4aszd823mslmMjBl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-white text-green-600 px-2 py-1 rounded-full font-bold text-xs hover:bg-gray-100 transition-all shadow-md">
                Upgrade
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Chat Container - Permanently expands when mobile ad is hidden */}
      <div
        className={`flex flex-1 min-h-0 transition-all duration-500 ease-in-out ${
          !showMobileAd || adPermanentlyHidden ? "md:flex-1" : ""
        }`}
      >
        {/* Left Sidebar: Advertisement (Desktop only) */}
        <div className="hidden md:flex w-64 bg-slate-800/80 backdrop-blur-xl border-r border-purple-500/20 flex-shrink-0 flex-col">
          <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
            <h3 className="text-white font-semibold flex items-center gap-2">
              🚀 Advertisement
            </h3>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-center">
            {/* Example Ad Block */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
              <h4 className="font-bold text-lg mb-2">🔥 Special Offer</h4>
              <p className="text-sm opacity-90 mb-3">
                Get 70% OFF on premium chat themes!
              </p>
              <a
                href="https://t.me/+4aszd823mslmMjBl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-white text-purple-600 px-3 py-1.5 rounded-full font-bold hover:bg-gray-100 transition-all shadow-md text-sm">
                  Grab Now
                </button>
              </a>
            </div>

            {/* Another Ad */}
            <div className="bg-slate-700/50 rounded-xl p-4 text-gray-200 shadow-md">
              <h4 className="font-bold text-base mb-2">📢 Sponsored</h4>
              <p className="text-sm opacity-80 mb-3">
                Join our Telegram group for exclusive deals and updates.
              </p>
              <a
                href="https://t.me/+4aszd823mslmMjBl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full font-semibold hover:opacity-90 transition-all text-sm">
                  Join Now
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Main Chat Area - Permanently expands to full height when mobile ad is hidden */}
        <div
          className={`flex-1 flex flex-col bg-slate-900/50 min-w-0 transition-all duration-500 ease-in-out ${
            !showMobileAd || adPermanentlyHidden
              ? "min-h-screen md:min-h-0"
              : ""
          }`}
        >
          {/* Chat Header - Adjusts position when ad is hidden */}
          <div
            className={`flex-shrink-0 p-3 lg:p-4 bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between transition-all duration-500 ease-in-out ${
              !showMobileAd ? "md:static" : ""
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <Hash className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400 flex-shrink-0" />
              <h2 className="text-base lg:text-lg xl:text-xl font-bold text-white truncate">
                {activeGroup?.name || "general"}
              </h2>
              <span className="hidden md:inline text-gray-400 text-sm truncate">
                Welcome to the main channel!
              </span>
            </div>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors flex-shrink-0"
              onClick={() => setShowGroups(true)}
            >
              <Menu className="w-5 h-5 lg:w-6 lg:h-6 text-gray-300" />
            </button>
          </div>

          {/* Messages Container with Scroll Detection - Permanently full height when ad hidden */}
          <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 transition-all duration-500 ease-in-out ${
              !showMobileAd || adPermanentlyHidden
                ? "max-h-screen md:max-h-none"
                : ""
            }`}
            style={{ scrollBehavior: "smooth" }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">
                  No messages yet. Start the conversation! 💬
                </p>
              </div>
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
                        <span className="font-semibold text-white text-sm lg:text-base truncate">
                          {isMe ? "You" : msg.sender}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(msg.chat_at)}
                        </span>
                        {isMe && (
                          <span className="text-xs flex-shrink-0">
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
          <div className="flex-shrink-0 bg-slate-800/90 backdrop-blur-xl border-t border-purple-500/20 p-3 lg:p-4">
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
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm lg:text-base min-w-0"
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
        <div className="hidden md:flex w-64 bg-slate-800/80 backdrop-blur-xl border-l border-purple-500/20 flex-shrink-0 flex-col">
          <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-400" /> Chat Groups
            </h3>
          </div>
          <div className="flex-1 p-2 space-y-1 overflow-y-auto">
            {groups.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">No groups available</p>
              </div>
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
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-lg flex-shrink-0">{group.icon}</span>
                    <span className="font-medium truncate">{group.name}</span>
                  </div>
                  {group.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
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
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowGroups(false)}
          ></div>

          <div
            className={`absolute right-0 top-0 h-full w-64 bg-slate-800/95 backdrop-blur-xl border-l border-purple-500/20 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
              showGroups ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
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

            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
              {groups.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center">
                    No groups available
                  </p>
                </div>
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
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-lg flex-shrink-0">
                        {group.icon}
                      </span>
                      <span className="font-medium truncate">{group.name}</span>
                    </div>
                    {group.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
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
