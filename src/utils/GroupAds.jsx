import React from "react";
import { useGroupStore } from "../store/groupStore";
import { motion } from "framer-motion";

const GroupAds = () => {
    const { ads } = useGroupStore();

    if (!ads || ads.length === 0) {
        return (
            <div className="text-gray-400 text-center py-4 text-sm">
                No ads available
            </div>
        );
    }

    return (
        <div className="space-y-4 p-3">
            {ads.map((ad, index) => (
                <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(168, 85, 247, 0.3)" }}
                    className="
                        relative rounded-xl overflow-hidden shadow-lg 
                        border border-white/10 bg-slate-900/40 backdrop-blur-md
                        transition-all cursor-pointer
                    "
                >

                    {ad.video && (
                        <motion.video
                            src={ad.video}
                            className="w-full h-44 md:h-52 object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="https://www.pixelstalk.net/wp-content/uploads/2016/07/3840x2160-Images-Free-Download.jpg"
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                        />
                    )}

                    {ad.image && (
                        <motion.img
                            src={ad.image}
                            alt="Ad Banner"
                            className="w-full h-44 md:h-52 object-cover"
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                        />
                    )}

                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <a
                            href={ad.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                bg-transparent border border-white text-white 
                                px-3 py-1.5 rounded-full font-semibold text-xs
                                hover:bg-white/10 hover:text-purple-400 transition-all
                            "
                        >
                            {ad.cta || "Learn More"}
                        </a>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};

export default GroupAds;
