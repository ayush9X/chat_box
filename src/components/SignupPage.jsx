import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ✅ Initialize navigate

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate inputs
  const validate = () => {
    let newErrors = {};
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "📱 Phone number must be exactly 10 digits";
    }
    if (formData.username.length < 3) {
      newErrors.username = "👤 Username must be at least 3 characters";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "✉️ Enter a valid email address";
    }
    if (formData.password.length < 6) {
      newErrors.password = "🔑 Password must be at least 6 characters";
    }
    return newErrors;
  };

  // Submit form
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setMessage("");

    try {
      const res = await axios.post(
        "https://chatbackendd-3.onrender.com/user/signup",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // ✅ Save token & user ID in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);

      setMessage("✅ Signup successful! Redirecting...");
      console.log("API Response:", res.data);

      // ✅ Redirect to dashboard after success
      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    } catch (err) {
      setMessage(
        "❌ Signup failed: " + (err.response?.data?.message || err.message)
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
        Create your account
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Or choose another way to sign up.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring focus:ring-indigo-200"
        />

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring focus:ring-indigo-200"
        />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
        )}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring focus:ring-indigo-200"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="name@work-email.com"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring focus:ring-indigo-200"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring focus:ring-indigo-200"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}

        <button
          type="submit"
          className="w-full bg-purple-800 text-white font-medium rounded-lg py-3 hover:bg-purple-900"
        >
          Sign Up
        </button>
      </form>

      {/* Response Message */}
      {message && <p className="mt-4 text-center">{message}</p>}

      {/* Divider */}
      <div className="flex items-center my-6 w-full max-w-md">
        <hr className="flex-grow border-gray-300" />
        <span className="px-3 text-gray-500 text-sm">OR SIGN UP WITH</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Social Signup */}
      <div className="flex justify-center gap-4">
        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-100">
          <FcGoogle className="text-xl" /> Google
        </button>
        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-100">
          <FaApple className="text-xl" /> Apple
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
