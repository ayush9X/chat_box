import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { link } from "./link";
import logo from "../assets/logo.png";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "618285673527-b8505poaasjv7g6sused9k746vhuvsu3.apps.googleusercontent.com";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleDataFilled, setIsGoogleDataFilled] = useState(false);

  const navigate = useNavigate();

  // Load Google OAuth script
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        const buttonElement = document.getElementById("google-signin-button");
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
          });
        }
      }
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  const handleGoogleResponse = (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const { email, name } = payload;

      setFormData((prev) => ({
        ...prev,
        name: name || "",
        email: email || "",
      }));
      setIsGoogleDataFilled(true);
    } catch (err) {
      setMessage("❌ Failed to load Google data.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "👤 Full name is required";
    if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "📱 Enter a valid 10-digit number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "✉️ Enter a valid email";
    if (formData.password.length < 6)
      newErrors.password = "🔑 Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post(
        `${link}/user/signup`,
        { ...formData, isGoogleUser: isGoogleDataFilled },
        { headers: { "Content-Type": "application/json" } }
      );

      // Save user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("username", res.data.user.username);

      // Show success message and redirect
      setMessage("✅ Signup successful! Redirecting...");
      setTimeout(() => {
        navigate("/chat", { replace: true });
      }, 1500);
    } catch (err) {
      setMessage(
        "❌ Signup failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-0">
          <img src={logo} alt="JoinChat Logo" className="w-28" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Create your account
        </h1>
        <p className="text-gray-600 text-center mt-1 mb-6">
          Sign up manually or continue with Google
        </p>

        {/* Google Section */}
        {!isGoogleDataFilled && (
          <div className="mb-6">
            <div id="google-signin-button" className="w-full"></div>

            <div className="flex items-center gap-2 my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-400 text-sm">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>
          </div>
        )}
        {isGoogleDataFilled && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex justify-between items-center">
            <button
              onClick={() => {
                setFormData({
                  name: "",
                  phoneNumber: "",
                  email: "",
                  password: "",
                });
                setIsGoogleDataFilled(false);
              }}
              className="text-green-600 hover:text-green-800 underline text-xs"
            >
              Clear
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none ${
              isGoogleDataFilled
                ? "bg-purple-50 border-purple-300"
                : "border-gray-300"
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number (10 digits)"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="name@work-email.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none ${
              isGoogleDataFilled
                ? "bg-purple-50 border-purple-300"
                : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Create Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}

          <button
            type="submit"
            className="w-full bg-purple-700 text-white rounded-lg py-3 font-medium hover:bg-purple-800 transition-colors"
          >
            Create Account
          </button>
        </form>

        {/* Response Message */}
        {message && (
          <div className="mt-4 text-center text-sm font-medium">
            <p
              className={
                message.includes("✅")
                  ? "text-green-600"
                  : message.includes("ℹ️")
                  ? "text-blue-600"
                  : "text-red-600"
              }
            >
              {message}
            </p>
          </div>
        )}

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-700 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
