import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { link } from "./link";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

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

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleAuth = () => {
      console.log("Initializing Google Auth...");
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID", // Replace with actual client ID
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google button
        const buttonElement = document.getElementById("google-signin-button");
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: "100%",
          });
        }

        console.log("Google Auth initialized successfully");
      } else {
        console.log("Google scripts not loaded yet");
      }
    };

    // Load Google Identity Services script
    if (!window.google) {
      console.log("Loading Google Identity Services script...");
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google script loaded");
        initializeGoogleAuth();
      };
      script.onerror = () => {
        console.error("Failed to load Google script");
        setMessage("❌ Failed to load Google services");
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  // Handle Google OAuth response - fills form data
  const handleGoogleResponse = async (response) => {
    console.log("Google response received:", response);
    setIsGoogleLoading(true);
    setMessage("");

    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      console.log("Decoded payload:", payload);
      const { email, name, picture } = payload;

      // Auto-fill form with Google data (no username - backend will generate)
      setFormData((prev) => ({
        ...prev,
        name: name || "",
        email: email || "",
      }));

      setIsGoogleDataFilled(true);
      setMessage(
        "✅ Google data loaded! Please add phone number and password to continue."
      );
    } catch (err) {
      console.error("Google auth error:", err);
      setMessage("❌ Failed to load Google data: " + err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle custom Google button click
  const handleGoogleClick = () => {
    console.log("Google button clicked");
    if (window.google) {
      try {
        window.google.accounts.id.prompt((notification) => {
          console.log("Google prompt notification:", notification);
          if (notification.isNotDisplayed()) {
            setMessage(
              "❌ Google sign-in popup was blocked. Please enable popups."
            );
          } else if (notification.isSkippedMoment()) {
            setMessage("ℹ️ Google sign-in was skipped.");
          }
        });
      } catch (error) {
        console.error("Error triggering Google prompt:", error);
        setMessage("❌ Error opening Google sign-in");
      }
    } else {
      console.log("Google services not available");
      setMessage("❌ Google services not loaded. Please refresh the page.");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };

  // Validate inputs (no username validation since backend generates it)
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "👤 Full name is required";
    }

    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "📱 Phone number must be exactly 10 digits";
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
        `https://wzl6mwg3-5000.inc1.devtunnels.ms/user/signup`,
        {
          ...formData,
          isGoogleUser: isGoogleDataFilled,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("username", res.data.user.username);

      setMessage("✅ Signup successful! Redirecting...");

      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    } catch (err) {
      setMessage(
        "❌ Signup failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Clear form data
  const handleClearForm = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      email: "",
      password: "",
    });
    setIsGoogleDataFilled(false);
    setErrors({});
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Create your account
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Fill manually or continue with Google to auto-fill
      </p>

      {/* Google Auth Section */}
      {!isGoogleDataFilled && (
        <div className="w-full max-w-md mb-6">
          {/* Google Official Button */}
          <div className="flex justify-center mb-4">
            <div id="google-signin-button" className="w-full"></div>
          </div>

          {/* Custom Google Button (fallback) */}
          <button
            onClick={handleGoogleClick}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FcGoogle className="text-xl" />
            {isGoogleLoading ? "Loading..." : "Continue with Google"}
          </button>

          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Google Client ID:{" "}
            {GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing"}
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500 text-sm">OR FILL MANUALLY</span>
            <hr className="flex-grow border-gray-300" />
          </div>
        </div>
      )}

      {/* Google Data Filled Indicator */}
      {isGoogleDataFilled && (
        <div className="w-full max-w-md mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FcGoogle className="text-lg" />
              <span className="text-green-700 text-sm font-medium">
                Data loaded from Google
              </span>
            </div>
            <button
              onClick={handleClearForm}
              className="text-green-600 hover:text-green-800 text-sm underline"
            >
              Clear & fill manually
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="space-y-3">
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                isGoogleDataFilled
                  ? "bg-blue-50 border-blue-300"
                  : "border-gray-300"
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number (10 digits)"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors"
              required
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="name@work-email.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                isGoogleDataFilled
                  ? "bg-blue-50 border-blue-300"
                  : "border-gray-300"
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Create Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-800 text-white font-medium rounded-lg py-3 mt-6 hover:bg-purple-900 transition-colors"
        >
          Create Account
        </button>
      </form>

      {/* Response Message */}
      {message && (
        <div className="mt-4 p-3 rounded-lg max-w-md w-full text-center">
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

      {/* Apple Sign Up (placeholder) */}
      <div className="mt-4 w-full max-w-md">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors"
        >
          <FaApple className="text-xl" />
          Continue with Apple
        </button>
      </div>

      {/* Login Option */}
      <p className="mt-6 text-gray-700 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-purple-800 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
