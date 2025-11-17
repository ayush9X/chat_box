import { create } from "zustand";
import { groupAds } from "../config/adsConfig";

export const useGroupStore = create((set, get) => ({
    groups: [],
    chats: [],
    ads: [],
    loading: false,
    chatLoading: false,

    groupError: null,
    chatError: null,

    groupsFetched: false,
    fetchedChats: {},

    fetchGroups: async () => {
        const { groupsFetched } = get();
        if (groupsFetched) return;

        try {
            set({ loading: true, groupError: null });

            const response = await fetch("https://joinchat.in/user/group");

            if (!response.ok) throw new Error("Failed to fetch groups");

            const data = await response.json();

            const formattedGroups = (data.groups || []).map((g) => ({
                id: g.id,
                name: g.chatTitle,
                chatCount: g.chat_count,
                createdAt: g.created_at,
            }));

            set({
                groups: formattedGroups,
                loading: false,
                groupsFetched: true,
            });

        } catch (err) {
            console.error("Group Fetch Error:", err);
            set({ groupError: "Failed to load groups", loading: false });
        }
    },

    fetchGroupChats: async (groupId, forceRefresh = false) => {
        const { fetchedChats } = get();

        if (fetchedChats[groupId] && !forceRefresh) {
            set({
                chats: fetchedChats[groupId],
                ads: groupAds[groupId] || groupAds.default,
            });
            return;
        }

        try {
            set({ chatLoading: true, chatError: null });

            const response = await fetch(`https://joinchat.in/user/groupchats/${groupId}`);

            if (!response.ok) throw new Error("Failed to fetch chats");

            const data = await response.json();

            const username = localStorage.getItem("username") || "";

            const formattedChats = (data.chats || []).map((c) => ({
                id: c.chat_id,
                chat: c.message,
                sender: c.username,
                email: c.email,
                phoneNumber: c.phoneNumber,
                time: c.chat_at,
                isMe: c.username === username,
            }));

            set((state) => ({
                chats: formattedChats,
                chatLoading: false,

                fetchedChats: {
                    ...state.fetchedChats,
                    [groupId]: formattedChats,
                },

                ads: groupAds[groupId] || groupAds.default,
            }));

        } catch (err) {
            console.error("Chat Fetch Error:", err);
            set({ chatError: "Failed to load chats", chatLoading: false });
        }
    },
}));
