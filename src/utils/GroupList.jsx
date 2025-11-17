import React, { useEffect } from "react";
import { useGroupStore } from "../store/groupStore";
import { useNavigate, useParams } from "react-router-dom";
import { Hash, Users, Clock } from "lucide-react";

const GroupList = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();

    const {
        groups,
        fetchGroups,
        loading,
        groupError,
    } = useGroupStore();

    useEffect(() => {
        fetchGroups();
    }, []);

    if (loading) {
        return (
            <div className="p-4 text-gray-300 text-center text-sm">
                Loading groups...
            </div>
        );
    }

    if (groupError) {
        return (
            <div className="p-4 text-red-400 text-center text-sm">
                Failed to load groups
            </div>
        );
    }

    if (!groups.length) {
        return (
            <div className="p-4 text-gray-300 text-center text-sm">
                No groups available
            </div>
        );
    }

    return (
        <div className="p-2 flex flex-col gap-3 overflow-y-auto">

            {groups.map((g) => {
                const isActive = String(groupId) === String(g.id);

                return (
                    <div
                        key={g.id}
                        onClick={() => {
                            if (!isActive) {
                                navigate(`/chat/${g.id}`);
                            }
                        }}
                        className={`
                            p-3 flex items-center gap-3 rounded-xl cursor-pointer transition-all 
                            duration-200 active:scale-[0.97]

                            ${isActive
                                ? "bg-purple-600/40 border border-purple-500 text-white shadow-md"
                                : "bg-slate-800/40 border border-purple-500/20 hover:bg-slate-800/60"
                            }
                        `}
                    >

                        <div className="bg-purple-600/40 p-2 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center">
                            <Hash className="w-5 h-5 text-purple-300" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-white text-sm md:text-base font-semibold truncate">
                                {g.name}
                            </h3>

                            <div className="flex flex-wrap gap-3 mt-1 text-gray-400 text-[11px] md:text-xs">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {g.chatCount}
                                </span>

                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {g.createdAt.slice(0, 10)}
                                </span>
                            </div>
                        </div>

                        <span className="text-purple-300 font-semibold text-lg">
                            ›
                        </span>

                    </div>
                );
            })}

        </div>
    );
};

export default GroupList;