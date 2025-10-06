import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { link } from "./link";
import logo from "../assets/logo.png"; // adjust the path if needed

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${link}/user/forgot-password`,
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 200) {
        // ✅ Save email in localStorage
        localStorage.setItem("email", email);

        // ✅ Redirect to OTP page
        navigate("/reset-password");
      }
    } catch (err) {
      setMessage(
        "❌ Error: " +
          (err.response?.data?.message || err.message || "Something went wrong")
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Logo */}
      <img src={logo} alt="JoinChat Logo" className="w-32 mb-6" />

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Reset your password
      </h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="email"
          name="email"
          placeholder="name@work-email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-800 text-white font-medium rounded-lg py-3 hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>

      {/* Response Message */}
      {message && (
        <div className="mt-4 p-3 rounded-lg max-w-md w-full text-center">
          <p className="text-red-600">{message}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-800"></div>
        </div>
      )}

      {/* Back to Login link */}
      <p className="mt-8 text-sm text-gray-600">
        Remember your password?{" "}
        <button
          onClick={handleBackToLogin}
          className="text-purple-600 hover:underline bg-none border-none cursor-pointer"
        >
          Back to Sign In
        </button>
      </p>
    </div>
  );
};

export default ForgotPassword;
