import React, { useState, useRef, useEffect } from "react";

const OtpPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    // Simulate fetching email from localStorage
    // In your actual app, this will work with real localStorage
    const storedEmail = "user@example.com"; // Simulated
    setEmail(storedEmail);
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.charAt(value.length - 1); // only last digit
    setOtp(newOtp);

    if (index < 5 && value) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    const newOtp = pastedData.split("");
    setOtp([...newOtp, ...new Array(6 - newOtp.length).fill("")]);

    // Focus on the next empty input or last input
    const nextIndex = Math.min(newOtp.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    // Validation
    if (otpCode.length !== 6) {
      setMessage("Please enter all 6 digits of OTP");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Simulated API call - replace with your actual API
      // const response = await axios.post(`${link}/user/reset-password`, {
      //   email,
      //   otp: otpCode,
      //   new_password: newPassword,
      // });

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = {
        data: {
          success: true,
          message: "Password reset successfully!",
        },
      };

      if (response.data.success) {
        setMessage("Password reset successfully! Redirecting to login...");

        // Clear stored email (optional)
        // localStorage.removeItem("email");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          // In your actual app: navigate("/login");
          setMessage("Redirected to login page ✓");
          // For demo purposes, we'll just show a message
        }, 2000);
      } else {
        setMessage(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("OTP resent successfully to your email!");
    } catch (error) {
      setMessage("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h2>
          <p className="text-gray-600">
            OTP sent to{" "}
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* OTP Boxes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-semibold transition-all"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
              required
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes("successfully") ||
                message.includes("Redirected")
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
            >
              Didn't receive OTP? Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpPage;
