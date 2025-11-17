import React from "react";
import video from "../assets/video.mp4";

const groupLinks = {
    1: "https://clickship.in/products/mega-mystery-box",
    2: "https://google.com",
    3: "https://openai.com",
    default: "https://clickship.in/products/mystery-box"
};

const ChatHeader = ({ groupId }) => {
    const ctaLink = groupLinks[groupId] || groupLinks.default;

    return (
        <div className="relative w-full h-32 md:h-40 lg:h-28 overflow-hidden">

            <div className="hidden md:block absolute inset-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="absolute inset-0 bg-black/25"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center px-4 lg:px-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">

                    <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="text-xl lg:text-3xl">🚀</div>

                        <div>
                            <h2 className="text-base text-white lg:text-lg font-bold drop-shadow-md">
                                Join Chat – 50% OFF!
                            </h2>
                            <p className="text-xs text-white lg:text-sm opacity-90 drop-shadow-md">
                                Unlock premium features instantly.
                            </p>
                        </div>
                    </div>

                    <div>
                        <a href={ctaLink} target="_blank" rel="noopener noreferrer">
                            <button
                                className="
                                    bg-white text-purple-600 
                                    px-3 lg:px-5 py-1.5 
                                    rounded-full font-semibold 
                                    hover:bg-gray-100 transition-all shadow-md 
                                    text-xs lg:text-sm
                                "
                            >
                                Join Group
                            </button>
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
