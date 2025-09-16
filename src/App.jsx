import React from "react";
import { Route, Routes } from "react-router-dom";
import ChatApp from "./components/ChatApp";
import SlackLogin from "./components/LoginPage"
import SignupPage from "./components/SignupPage";

const App = () => {
  return (
    <>
      <Routes>
        {/* <Route path="/dashboard" element={<ChatApp />} /> */}
        <Route path="/login" element={<SlackLogin />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chat" element={<ChatApp />} />
      </Routes>
    </>
  );
};

export default App;
