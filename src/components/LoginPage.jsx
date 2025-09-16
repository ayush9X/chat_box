import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const SlackLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "https://chatbackendd-3.onrender.com/user/login",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // ✅ Save token & userId in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);

      setMessage("✅ Login successful! Redirecting...");
      console.log("Login Response:", res.data);

      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    } catch (err) {
      setMessage(
        "❌ Login failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Slack Logo */}
      <div className="mb-6">
        <img
          src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
          alt="Slack Logo"
          className="w-12 h-12 mx-auto"
        />
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Enter your email to sign in
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Or choose another way to sign in.
      </p>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-md">
        <input
          type="email"
          name="email"
          placeholder="name@work-email.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring focus:ring-indigo-200"
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring focus:ring-indigo-200"
        />

        <button
          type="submit"
          className="w-full bg-purple-800 text-white font-medium rounded-lg py-3 hover:bg-purple-900"
        >
          Sign In With Email
        </button>
      </form>

      {/* Response Message */}
      {message && <p className="mt-4 text-center">{message}</p>}

      {/* Divider */}
      <div className="flex items-center my-6 w-full max-w-md">
        <hr className="flex-grow border-gray-300" />
        <span className="px-3 text-gray-500 text-sm">OR SIGN IN WITH</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Social Login */}
      <div className="flex justify-center gap-4">
        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-100">
          <FcGoogle className="text-xl" /> Google
        </button>
        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-100">
          <FaApple className="text-xl" /> Apple
        </button>
      </div>

      {/* Signup link */}
      <p className="mt-8 text-sm text-gray-600">
        New to Slack?{" "}
        <a href="/signup" className="text-indigo-600 hover:underline">
          Create an account
        </a>
      </p>
    </div>
  );
};

export default SlackLogin;
