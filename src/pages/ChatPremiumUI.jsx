import React, { useState, useEffect, useRef } from "react";
import { Send, Menu, Wifi, WifiOff, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Linkify from "react-linkify";
import { useGroupStore } from "../store/groupStore";
import GroupList from "../utils/GroupList";
import GroupAds from "../utils/GroupAds";
import ChatHeader from "../utils/ChatHeader";
import MobileJoinPopup from "../components/MobileJoinPopup"

const socket = io("https://joinchat.in", {
    transports: ["websocket"],
});

const ChatPremiumUI = () => {

    const { groupId } = useParams();
    const { groups, chats, chatLoading, fetchGroupChats } = useGroupStore();

    const [currentMessage, setCurrentMessage] = useState("");
    const [openGroupsMobile, setOpenGroupsMobile] = useState(false);

    const messagesEndRef = useRef(null);

    // ---------------------------
    // LOAD CHATS & JOIN ROOM
    // ---------------------------
    useEffect(() => {
        if (groupId) {
            fetchGroupChats(groupId);
            socket.emit("join", { room: `group_${groupId}` });
        }
    }, [groupId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats]);

    useEffect(() => {
        const handleMessage = (data) => {
            const myID = localStorage.getItem("username");

            if (String(data.sender) === String(myID)) return;

            useGroupStore.setState((state) => ({
                chats: [
                    ...state.chats,
                    {
                        id: data.id,
                        chat: data.chat,          // socket sends "chat"
                        sender: data.sender,
                        isMe: false,
                        time: data.chat_at
                    }
                ]
            }));
        };

        socket.on("receive_message", handleMessage);
        return () => socket.off("receive_message", handleMessage);

    }, [groupId]);


    const activeGroup = groups.find((g) => String(g.id) === String(groupId));
    const isConnected = true;

    const sendMessage = async () => {
        if (!currentMessage.trim()) return;
        if (!groupId) return;

        const userID = localStorage.getItem("userId");

        const payload = {
            userID,
            groupID: Number(groupId),
            message: currentMessage,
        };

        try {
            const res = await fetch("https://joinchat.in/user/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.status === "success") {
                useGroupStore.setState((state) => ({
                    chats: [
                        ...state.chats,
                        {
                            id: result.chat.id,
                            chat: result.chat.chat,
                            sender: "You",
                            isMe: true,
                            time: result.chat.chat_at,
                        }
                    ]
                }));

                setCurrentMessage("");
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }

        } catch (error) {
            console.log("Send Chat Error:", error);
        }
    };

    return (
        <div className="h-screen flex flex-col">

            <div className="hidden md:block">
                <ChatHeader groupId={groupId} />
            </div>

            <div className="flex flex-1 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white overflow-hidden relative">
                <MobileJoinPopup />
                <button
                    onClick={() => setOpenGroupsMobile(true)}
                    className="absolute top-3 left-3 z-50 p-2 bg-purple-700/50 rounded-lg md:hidden"
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>

                <div className="hidden md:flex w-64 bg-slate-900/40 border-r border-purple-500/20 flex-col">
                    <div className="p-6 border-b border-purple-500/20 font-semibold text-lg">Groups</div>
                    <div className="flex-1 overflow-y-auto">
                        <GroupList />
                    </div>
                </div>

                {openGroupsMobile && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden">

                        <div className="absolute top-0 left-0 h-full w-64 bg-slate-900 border-r border-purple-500/20">

                            <div className="p-4 border-b border-purple-500/20 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Groups</h2>
                                <button
                                    onClick={() => setOpenGroupsMobile(false)}
                                    className="p-1 bg-slate-800 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto h-[calc(100%-60px)] p-2">
                                <GroupList />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col">

                    <div
                        className="p-3 md:p-4 border-b border-purple-500/20 bg-slate-900/40 
             flex items-center justify-between sticky top-0 z-20"
                    >
                        <div
                            className="
      flex flex-col 
      text-center md:text-left 
      w-full md:w-auto
    "
                        >
                            <h2 className="text-lg font-bold">
                                {activeGroup?.name || `Group ${groupId}`}
                            </h2>
                            <p className="text-xs text-gray-300 hidden md:block">
                                Chat with your community
                            </p>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-xs">
                            <Wifi className="text-green-400 w-4 h-4" />
                            Connected
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">

                        {chatLoading ? (
                            <div className="text-center text-gray-400 py-6">Loading chats...</div>
                        ) : chats.length === 0 ? (
                            <div className="text-center text-gray-400 py-6">No messages yet.</div>
                        ) : (
                            chats.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[75%] md:max-w-[60%] p-3 rounded-xl ${msg.isMe
                                            ? "bg-purple-600/40 border border-purple-500/40"
                                            : "bg-slate-800/40"
                                            }`}
                                    >
                                        <p className="text-xs opacity-80">
                                            {msg.isMe ? "You" : msg.sender}
                                        </p>
                                        <p className="mt-1 text-sm break-words">
                                            <Linkify
                                                componentDecorator={(decoratedHref, decoratedText, key) => (
                                                    <a
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        href={decoratedHref}
                                                        key={key}
                                                        className="text-blue-400 underline hover:text-blue-300"
                                                    >
                                                        {decoratedText}
                                                    </a>
                                                )}
                                            >
                                                {msg.chat}
                                            </Linkify>
                                        </p>
                                        <span className="text-[10px] text-gray-400 block mt-1">
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-purple-500/20 bg-slate-900/40 sticky bottom-0">
                        <div className="flex items-center bg-slate-800/40 border border-purple-500/20 rounded-full px-2 py-1">
                            <input
                                type="text"
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent outline-none text-sm px-2"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full ml-2"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                </div>

                <div className="hidden xl:flex w-72 bg-slate-900/40 border-l border-purple-500/20 flex-col">
                    <div className="p-6 border-b border-purple-500/20 font-semibold text-lg">
                        Sponsored
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <GroupAds />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChatPremiumUI;