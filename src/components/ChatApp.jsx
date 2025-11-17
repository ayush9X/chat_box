import Linkify from "linkify-react"
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Send,
  Users,
  Hash,
  Plus,
  Menu,
  Wifi,
  WifiOff,
  HouseWifi,
} from "lucide-react";

import video from "../assets/video.mp4";
import MobileJoinPopup from "./MobileJoinPopup";

const link = "https://joinchat.in/";

const ChatApp = () => {
  const [aiSummary] = useState({
    topic: "Event: Win MacBook",
    description:
      "People are talking about event in which you can win MacBook and event updates on 6 PM",
    lastUpdate: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
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
  const [activeUsers, setActiveUsers] = useState(128);
  const [liveVisitors, setLiveVisitors] = useState(() => {
    return Math.floor(Math.random() * 301) + 200;
  });

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastScrollTop = useRef(0);

  const toggleMobileAd = () => {
    if (adPermanentlyHidden && showAdToggle) {
      setShowMobileAd(true);
      setAdPermanentlyHidden(false);
      setShowAdToggle(false);
      lastScrollTop.current = 0;
    } else if (!adPermanentlyHidden && showMobileAd) {
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

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const currentScrollTop = messagesContainer.scrollTop;

      if (!adPermanentlyHidden) {
        if (currentScrollTop < lastScrollTop.current && currentScrollTop > 0) {
          if (scrollDirection !== "up") {
            setScrollDirection("up");
            setShowMobileAd(false);
            setAdPermanentlyHidden(true);
            setShowAdToggle(true);
          }
        } else if (
          currentScrollTop > lastScrollTop.current &&
          currentScrollTop > 10
        ) {
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
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors((prev) => {
        const change = Math.floor(Math.random() * 16) - 5;
        const newCount = prev + change;
        return Math.max(200, newCount);
      });
    }, Math.random() * 5000 + 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let initialized = false;

    if (!initialized) {
      let storedUserId = localStorage.getItem("userId");
      let storedUsername = localStorage.getItem("username");

      if (!storedUserId) {
        storedUserId = Date.now().toString();
        localStorage.setItem("userId", storedUserId);
      }

      if (!storedUsername) {
        storedUsername = `User${storedUserId}`;
        localStorage.setItem("username", storedUsername);
      }

      setUserID(storedUserId);
      setUsername(storedUsername);

      initialized = true;
    }
  }, []);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
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
            setIsConnected(true);
          });

          newSocket.on("disconnect", (reason) => {
            setIsConnected(false);
          });

          newSocket.on("connect_error", (error) => {
            setIsConnected(false);
          });

          newSocket.on("reconnect", (attemptNumber) => {
            setIsConnected(true);
          });

          setTimeout(() => {
            if (!newSocket.connected) {
              setIsConnected(false);
            }
          }, 5000);
        }
      } catch (error) {
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

  useEffect(() => {
    if (isConnected && pendingMessages.length > 0 && socket) {
      pendingMessages.forEach((msg) => {
        sendMessageToServer(msg.message, msg.groupID);
      });
      setPendingMessages([]);
    }
  }, [isConnected, pendingMessages, socket]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${link}/user/group`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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
      console.log(err)
      const demoGroups = [
        { id: "1", name: "General", icon: "#", active: true, unread: 0 },
        { id: "2", name: "Random", icon: "#", active: false, unread: 2 },
        { id: "3", name: "Tech Talk", icon: "#", active: false, unread: 0 },
        { id: "4", name: "Support", icon: "#", active: false, unread: 1 },
      ];
      setGroups(demoGroups);
      setActiveGroup(demoGroups[0]);
      await fetchChats(demoGroups[0].id);
    }
  };

  const fetchChats = async (groupId) => {
    try {
      const response = await fetch(`${link}/user/chat?groupID=${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.chats)) {
        const sortedChats = [...data.chats].sort(
          (a, b) => new Date(a.chat_at) - new Date(b.chat_at)
        );
        setMessages(sortedChats);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.log(err)
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!activeGroup || !socket) return;

    const room = `group_${activeGroup.id}`;
    socket.emit("join", { room });

    const handleMessage = (msg) => {
      const formattedMsg = {
        sender: msg.sender,
        chat: msg.message || msg.chat,
        chat_at: msg.chat_at || new Date().toISOString(),
        groupID: msg.groupID,
        status: "sent",
      };

      if (String(formattedMsg.sender) === String(username)) {
        return;
      }
      setMessages((prev) => [...prev, formattedMsg]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.emit("leave", { room });
    };
  }, [activeGroup, socket, username]);


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
        return true;
      } else {
        return true;
      }
    } catch (err) {
      console.log(err)
      return true;
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleGroupClick = async (index) => {
    const selectedGroup = groups[index];
    setGroups((prev) => prev.map((g, i) => ({ ...g, active: i === index })));
    setActiveGroup(selectedGroup);

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
      className={`h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden transition-all duration-500 ease-in-out ${!showMobileAd ? "md:h-screen" : ""
        }`}
    >
      <div className="hidden md:block relative flex-shrink-0 text-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 py-4 lg:py-6 px-4 lg:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-5">
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
              className={`flex items-center gap-2 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm ${isConnected
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

            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-400/30">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Live:</span>
              <span className="font-bold">{liveVisitors}</span>
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

      <div
        className={`md:hidden bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/20 transition-all duration-500 ease-in-out transform ${showMobileAd && !adPermanentlyHidden
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
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isConnected
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
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-400/30">
              <Users className="w-3 h-3" />
              <span className="font-semibold">{liveVisitors}</span>
            </div>
          </div>
        </div>
        <div className="p-3 flex gap-3 overflow-x-auto">
          <div className="relative min-w-48 h-48 rounded-lg overflow-hidden shadow-lg">
            <video
              src="/vd1.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="https://www.pixelstalk.net/wp-content/uploads/2016/07/3840x2160-Images-Free-Download.jpg" // optional fallback image
            ></video>

            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <a
                href="https://clickship.in/products/pre-sale-exclusive-fashion-tech-combo-smartwatch-wireless-earbuds-graphic-tee-diwali-festive-gift"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className="bg-transparent border border-white text-white px-3 py-1.5 rounded-full 
                 font-semibold text-xs hover:bg-white/10 hover:text-purple-500 transition-all"
                >
                  Claim Now
                </button>
              </a>
            </div>
          </div>

          <div className="relative min-w-48 h-48 rounded-lg overflow-hidden shadow-lg">
            <video
              src="/vd2.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="https://www.pixelstalk.net/wp-content/uploads/2016/07/3840x2160-Images-Free-Download.jpg" // optional fallback image
            ></video>

            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <a
                href="https://clickship.in/collections/mega-mystery-box-10-surprises"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className="bg-transparent border border-white text-white px-3 py-1 rounded-full 
                 font-bold text-xs hover:bg-white/10 hover:text-purple-400 transition-all"
                >
                  Claim Now
                </button>
              </a>
            </div>
          </div>

          <div className="relative min-w-48 h-48 rounded-lg overflow-hidden shadow-lg">
            <video
              src="/vd3.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="https://www.pixelstalk.net/wp-content/uploads/2016/07/3840x2160-Images-Free-Download.jpg"
            ></video>

            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <a
                href="https://clickship.in/products/silver-reward-box-shop-5000-unlock-macbook-startup-funding-chance"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className="bg-transparent border border-white text-white px-3 py-1 rounded-full 
                 font-bold text-xs hover:bg-white/10 hover:text-purple-400 transition-all"
                >
                  Claim Now
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
      <MobileJoinPopup />

      {/* Main Chat Container - Permanently expands when mobile ad is hidden */}
      <div
        className={`flex flex-1 min-h-0 transition-all duration-500 ease-in-out ${!showMobileAd || adPermanentlyHidden ? "md:flex-1" : ""
          }`}
      >
        <div className="hidden md:flex w-64 bg-slate-800/80 backdrop-blur-xl border-r border-purple-500/20 flex-shrink-0 flex-col">
          <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
            <h3 className="text-white font-semibold flex items-center gap-2">
              🚀 Advertisement
            </h3>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-center">
            <div className="relative min-w-48 h-48 rounded-lg overflow-hidden shadow-lg">
              <video
                src="/vd2.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                poster="https://www.pixelstalk.net/wp-content/uploads/2016/07/3840x2160-Images-Free-Download.jpg"
              ></video>

              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <a
                  href="https://clickship.in/collections/mega-mystery-box-10-surprises"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    className="bg-transparent border border-white text-white px-3 py-1 rounded-full 
                 font-bold text-xs hover:bg-white/10 hover:text-purple-400 transition-all"
                  >
                    Claim Now
                  </button>
                </a>
              </div>
            </div>

            <div className="relative min-w-48 h-48 rounded-lg overflow-hidden shadow-lg">
              <video
                src="/vd3.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                poster="https://www.pixelstalk.net/wp-content/uploads/2016/07/3840x2160-Images-Free-Download.jpg"
              ></video>

              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <a
                  href="https://clickship.in/products/silver-reward-box-shop-5000-unlock-macbook-startup-funding-chance"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    className="bg-transparent border border-white text-white px-3 py-1 rounded-full 
                 font-bold text-xs hover:bg-white/10 hover:text-purple-400 transition-all"
                  >
                    Claim Now
                  </button>
                </a>
              </div>
            </div>

            <div className="relative min-w-48 h-48 rounded-lg overflow-hidden shadow-lg">
              <video
                src="/vd1.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              ></video>

              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <a
                  href="https://clickship.in/products/pre-sale-exclusive-fashion-tech-combo-smartwatch-wireless-earbuds-graphic-tee-diwali-festive-gift"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    className="bg-transparent border border-white text-white px-3 py-1 rounded-full 
                 font-bold text-xs hover:bg-white/10 hover:text-purple-400 transition-all"
                  >
                    Claim Now
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col bg-slate-900/50 min-w-0 transition-all duration-500 ease-in-out ${!showMobileAd || adPermanentlyHidden
            ? "min-h-screen md:min-h-0"
            : ""
            }`}
        >
          <div
            className={`flex-shrink-0 p-3 lg:p-4 bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between transition-all duration-500 ease-in-out ${!showMobileAd ? "md:static" : ""
              }`}
          >
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <HouseWifi className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400 flex-shrink-0" />
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

          <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 transition-all duration-500 ease-in-out ${!showMobileAd || adPermanentlyHidden
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
                    className={`flex items-start gap-3 p-3 rounded-lg max-w-[85%] lg:max-w-[80%] transition-all duration-200 ${isMe
                      ? "bg-purple-800/40 ml-auto flex-row-reverse"
                      : "hover:bg-slate-800/30"
                      }`}
                  >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                      👤
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`flex items-center gap-2 mb-1 ${isMe ? "justify-end flex-row-reverse" : ""
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
                      <Linkify
                        options={{
                          target: "_blank",
                          className: "text-blue-400 underline hover:text-blue-300",
                          rel: "noopener noreferrer",
                        }}
                      >
                        <p className="text-gray-200 break-words text-sm lg:text-base">{msg.chat}</p>
                      </Linkify>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>


          <div className="flex-shrink-0 bg-slate-800/90 backdrop-blur-xl border-t border-purple-500/20 p-3 lg:p-4">
            <div className="flex items-center gap-2 lg:gap-3 bg-slate-700/50 rounded-xl p-2 lg:p-3 border border-purple-500/20">
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
                className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${isConnected
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


        {/* Groups Section  */}
        <div className="hidden md:flex w-64 bg-slate-800/80 backdrop-blur-xl border-l border-purple-500/20 flex-shrink-0 flex-col">
          <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <HouseWifi className="w-5 h-5 text-purple-400" /> Chat Groups
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
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${group.active
                    ? "bg-purple-600/50 text-white"
                    : "hover:bg-slate-700/50 text-gray-300 hover:text-white"
                    }`}
                  onClick={() => handleGroupClick(i)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <HouseWifi className="text-lg flex-shrink-0" />
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

          {/* AI Summary Section - At Bottom */}
          <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
              <span className="text-lg">🤖</span> AI Summary
            </h3>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-3 border border-purple-500/30">
              <h4 className="text-purple-300 font-semibold text-sm mb-2 flex items-center gap-2">
                <span>🎯</span> {aiSummary.topic}
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed mb-2">
                {aiSummary.description}
                <p>
                  <a
                    href="https://www.codeheaven.in/"
                    class="text-amber-500/40 hover:text-amber-400 font-thin transition-colors"
                  >
                    Developed by Code Heaven
                  </a>
                </p>
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-purple-500/20">
                <span>Last updated</span>
                <span className="text-purple-300">{aiSummary.lastUpdate}</span>
              </div>
            </div>
          </div>
        </div>


        {/* Mobile Groups Drawer */}
        <div
          className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${showGroups ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowGroups(false)}
          ></div>

          <div
            className={`absolute right-0 top-0 h-full w-64 bg-slate-800/95 backdrop-blur-xl border-l border-purple-500/20 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${showGroups ? "translate-x-0" : "translate-x-full"
              }`}
          >
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <HouseWifi className="w-5 h-5 text-purple-400" /> Chat Groups
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
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${group.active
                      ? "bg-purple-600/50 text-white"
                      : "hover:bg-slate-700/50 text-gray-300 hover:text-white"
                      }`}
                    onClick={() => {
                      handleGroupClick(i);
                      setShowGroups(false);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <HouseWifi className="text-lg flex-shrink-0 text-purple-400" />
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

            {/* AI Summary Section - Mobile - At Bottom */}
            <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-3 text-sm">
                <span>🤖</span> AI Summary
              </h3>
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-3 border border-purple-500/30">
                <h4 className="text-purple-300 font-semibold text-xs mb-2 flex items-center gap-2">
                  <span>🎯</span> {aiSummary.topic}
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed mb-2">
                  {aiSummary.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-purple-500/20">
                  <span>Last updated</span>
                  <span className="text-purple-300">
                    {aiSummary.lastUpdate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
