import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { link } from "./link";
import logo from "../assets/logo.png"; // adjust the path if needed

const SlackLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${link}/user/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      // Save token & user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("username", res.data.user.username);

      setMessage("✅ Login successful! Redirecting...");
      console.log("Login Response:", res.data);

      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    } catch (err) {
      setMessage(
        "❌ Login failed: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Logo */}
      <img src={logo} alt="JoinChat Logo" className="w-32 mb-6" />

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Sign in to your workspace
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Enter your email and password to continue.
      </p>

      {/* Email/Password Form */}
      <form onSubmit={handleLogin} className="w-full max-w-md">
        <input
          type="email"
          name="email"
          placeholder="name@work-email.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-800 text-white font-medium rounded-lg py-3 hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In With Email"}
        </button>
      </form>

      {/* Response Message */}
      {message && (
        <div className="mt-4 p-3 rounded-lg max-w-md w-full text-center">
          <p
            className={`${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-800"></div>
        </div>
      )}

      {/* Signup link */}
      <p className="mt-8 text-sm text-gray-600">
        New to Slack?{" "}
        <a href="/" className="text-purple-600 hover:underline">
          Create an account
        </a>
      </p>
    </div>
  );
};

export default SlackLogin;
