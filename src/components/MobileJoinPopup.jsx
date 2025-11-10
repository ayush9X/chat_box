import React, { useState, useEffect } from "react";
import logo from "../assets/header.png";

const MobileJoinPopup = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) setVisible(true);
            else setVisible(false);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!visible) return null;

    // 🟢 Replace with your Telegram group link
    const telegramLink = "https://t.me/+4aszd823mslmMjBl";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="relative w-full max-w-xs bg-gradient-to-br from-white via-white/90 to-blue-50 rounded-3xl shadow-2xl border border-blue-100 p-5 text-center animate-slideUp">
                <button
                    onClick={() => setVisible(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                >
                    ✕
                </button>

                <div className="flex justify-center mb-3">
                    <img
                        src={logo}
                        alt="JoinChat"
                        className="w-28 h-28 rounded-full shadow-md border border-blue-200 object-cover"
                    />
                </div>

                <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                    🚀 Join the Chat Revolution!
                </h2>

                <p className="text-gray-600 text-sm font-medium mb-4 leading-relaxed">
                    Meet awesome people 💬, grab exclusive deals 💸, and never miss
                    exciting <span className="font-semibold text-blue-600">events</span> again.
                </p>

                <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                >
                    👉 Join the Community
                </a>

                <p className="text-[12px] text-gray-500 mt-3">
                    ❤️ 20,000+ members already joined
                </p>
            </div>
        </div>
    );
};

export default MobileJoinPopup;
