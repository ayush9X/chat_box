import React from "react";
import { useLocation } from "react-router-dom";
import moment from "moment";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const ChatsPage = () => {
  const location = useLocation();
  const chatData = location.state?.chatData;

  const exportChatsToCSV = () => {
    if (!chatData || !chatData.chats || chatData.chats.length === 0) return;

    const headers = [
      "Chat ID",
      "Message",
      "Sent At",
      "Sender Name",
      "Sender Email",
      "Group Title",
      "Receiver Name",
      "Receiver Email",
    ];

    const rows = chatData.chats.map((chat) => [
      chat.id,
      `"${chat.chat.replace(/"/g, '""')}"`, // Escape quotes
      moment(chat.chat_at).format("YYYY-MM-DD HH:mm:ss"),
      chat.sender?.name || "",
      chat.sender?.email || "",
      chat.group?.chatTitle || "",
      chat.receiver?.name || "",
      chat.receiver?.email || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user_chats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!chatData || !chatData.chats || chatData.chats.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <h2 className="text-xl font-semibold mb-2">No Chats Found</h2>
        <p>Looks like this user hasn’t started chatting yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">User Chats</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={exportChatsToCSV}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition"
        >
          Download CSV
        </button>
      </div>

      {chatData.chats.map((chat) => (
        <div
          key={chat.id}
          className="mb-5 p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                {getInitials(chat.sender.name)}
              </div>
              <div>
                <p className="text-gray-900 font-semibold">
                  {chat.sender.name}
                </p>
                <p className="text-gray-500 text-sm">{chat.sender.email}</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {moment(chat.chat_at).format("MMM Do YYYY, h:mm A")}
            </span>
          </div>

          <div className="ml-12">
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800">
              {chat.chat}
            </div>
            <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
              <span>
                Group:{" "}
                <span className="font-medium text-blue-700">
                  {chat.group.chatTitle}
                </span>
              </span>
              {chat.receiver && (
                <span>
                  To:{" "}
                  <span className="font-medium">
                    {chat.receiver.name} ({chat.receiver.email})
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatsPage;
