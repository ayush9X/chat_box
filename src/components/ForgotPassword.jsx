import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { link } from "./link";
import logo from "../assets/logo.png"; // adjust the path if needed

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${link}/user/forgot-password`,
        {
          email,
          new_password: newPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 200) {
        setMessage("✅ Password updated successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setMessage(
        "❌ " +
        (err.response?.data?.message || err.message || "Something went wrong.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <img src={logo} alt="JoinChat Logo" className="w-28 mb-6" />

      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Reset Your Password
      </h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Enter your registered email and a new password below.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 border border-gray-100"
      >
        <input
          type="email"
          name="email"
          placeholder="name@work-email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-800 text-white font-medium rounded-lg py-3 hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
          >
            {message}
          </p>
        )}
      </form>

      <p className="mt-8 text-sm text-gray-600">
        Remember your password?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-purple-600 hover:underline bg-none border-none cursor-pointer"
        >
          Back to Sign In
        </button>
      </p>
    </div>
  );
};

export default ForgotPassword;
