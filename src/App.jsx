import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SlackLogin from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import AdminLayout from "./components/Admin";
import PostsPage from "./components/PostsPage";
import GroupsPage from "./components/GroupsPage";
import UsersPage from "./components/UsersPage";
import ForgotPassword from "./components/ForgotPassword";
import OtpPage from "./components/OtpPage";
import ChatsPage from "./components/ChatsPage";
import ChatPremiumUI from "./pages/ChatPremiumUI";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SignupPage />} />
      <Route path="/login" element={<SlackLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<OtpPage />} />
      <Route path="/chat" element={<Navigate to="/chat/1" replace />} />
      <Route path="/chat/:groupId" element={<ChatPremiumUI />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="posts" element={<PostsPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route index element={<PostsPage />} /> {/* Default route */}
      </Route>

    </Routes>
  );
};

export default App;
