import video from "../assets/video.mp4"

export const groupAds = {
    1: [
        {
            id: "ad1",
            video: "/vd1.mp4",
            link: "https://clickship.in/products/mega-mystery-box",
            cta: "Claim Now",
        },
        {
            id: "ad2",
            video: "/vd2.mp4",
            link: "https://clickship.in/products/startup-reward-box",
            cta: "Buy Now",
        },
        {
            id: "ad3",
            video: "/vd3.mp4",
            link: "https://clickship.in/products/startup-reward-box",
            cta: "Buy Now",
        },
    ],
    2: [
        {
            id: "ad1",
            video: "/ads/group2.mp4",
            link: "https://google.com",
            cta: "Learn More",
        },
        {
            id: "ad2",
            video: "/ads/group2.mp4",
            link: "https://google.com",
            cta: "Learn More",
        },
        {
            id: "ad3",
            video: "/ads/group2.mp4",
            link: "https://google.com",
            cta: "Learn More",
        },
    ],
    3: [
        {
            id: "ad4",
            image: "/ads/ai-banner.jpg",
            link: "https://openai.com",
            cta: "Explore",
        },
        {
            id: "ad5",
            image: "/ads/ai-banner.jpg",
            link: "https://openai.com",
            cta: "Explore",
        },
        {
            id: "ad6",
            image: "/ads/ai-banner.jpg",
            link: "https://openai.com",
            cta: "Explore",
        },
    ],

    default: [
        {
            id: "default1",
            video: "/vd1.mp4",
            link: "https://clickship.in/products/mystery-box",
            cta: "Shop Now",
        },
    ],
};



export const groupHeaders = {
    1: {
        video: {video},
        title: "🚀 Startup Growth Community",
        desc: "Join India's fastest growing startup chat group!",
        link: "https://clickship.in/products/mega-mystery-box",
        cta: "Claim Now"
    },
    2: {
        video: {video},
        title: "🧠 AI Community Group",
        desc: "Daily AI tricks, tools & automation secrets!",
        link: "https://google.com",
        cta: "Learn More"
    },
    3: {
        video: {video},
        title: "💼 Business Leaders Hub",
        desc: "Network with founders, CEOs & investors.",
        link: "https://openai.com",
        cta: "Explore"
    },
    default: {
        video: {video},
        title: "🔥 Join Chat – Special Offer!",
        desc: "Unlock premium features & startup rewards!",
        link: "https://clickship.in/products/mystery-box",
        cta: "Shop Now"
    }
};
