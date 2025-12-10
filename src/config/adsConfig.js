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
    4: [
        {
            id: "adsterra1",
            adType: "adsterra",
            code: `
                <script type="text/javascript">
                  atOptions = {
                    'key' : '9202cf055130ece518be2c72ec72db2f',
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                  };
                </script>
                <script type="text/javascript" src="//www.highperformanceformat.com/9202cf055130ece518be2c72ec72db2f/invoke.js"></script>
            `
        }
    ],

    5: [
        {
            id: "adsterra-160x600",
            adType: "adsterra",
            code: `
            <script type="text/javascript">
              atOptions = {
                'key' : 'e13082563d0a8f6b64df85183e5aee18',
                'format' : 'iframe',
                'height' : 600,
                'width' : 160,
                'params' : {}
              };
            </script>
            <script
              type="text/javascript"
              src="//www.highperformanceformat.com/e13082563d0a8f6b64df85183e5aee18/invoke.js">
            </script>
        `
        },

        {
            id: "adsterra-728x90",
            adType: "adsterra",
            code: `
            <script type="text/javascript">
              atOptions = {
                'key' : '32ca96d4fc1eb0dae56d60f461d49581',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script
              type="text/javascript"
              src="//www.highperformanceformat.com/32ca96d4fc1eb0dae56d60f461d49581/invoke.js">
            </script>
        `
        }
    ],

    6: [
        {
            id: "adsterra-468x60",
            adType: "adsterra",
            code: `
            <script type="text/javascript">
              atOptions = {
                'key' : 'cde3566be7176b64254fdb8395767493',
                'format' : 'iframe',
                'height' : 60,
                'width' : 468,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/cde3566be7176b64254fdb8395767493/invoke.js"></script>
        `
        }
    ],

    7: [
        {
            id: "effectivegate-728x90",
            adType: "adsterra",
            code: `
            <script async="async" data-cfasync="false" src="//pl28227102.effectivegatecpm.com/a11679e12b093be9943b8d2fadf426a6/invoke.js"></script>
            <div id="container-a11679e12b093be9943b8d2fadf426a6"></div>
        `
        }
    ],
    8: [
        {
            id: "adsterra-160x300",
            adType: "adsterra",
            code: `
            <script type="text/javascript">
              atOptions = {
                'key' : 'bd63353aa34fbedde1eedf7224d5d6c8',
                'format' : 'iframe',
                'height' : 300,
                'width' : 160,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/bd63353aa34fbedde1eedf7224d5d6c8/invoke.js"></script>
        `
        }
    ],
    9: [
        {
            id: "adsterra-320x50",
            adType: "adsterra",
            code: `
            <script type="text/javascript">
              atOptions = {
                'key' : 'afa588da1f0d9925d578b72d0fc66882',
                'format' : 'iframe',
                'height' : 50,
                'width' : 320,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/afa588da1f0d9925d578b72d0fc66882/invoke.js"></script>
        `
        }
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
        video: { video },
        title: "🚀 Startup Growth Community",
        desc: "Join India's fastest growing startup chat group!",
        link: "https://clickship.in/products/mega-mystery-box",
        cta: "Claim Now"
    },
    2: {
        video: { video },
        title: "🧠 AI Community Group",
        desc: "Daily AI tricks, tools & automation secrets!",
        link: "https://google.com",
        cta: "Learn More"
    },
    3: {
        video: { video },
        title: "💼 Business Leaders Hub",
        desc: "Network with founders, CEOs & investors.",
        link: "https://openai.com",
        cta: "Explore"
    },
    default: {
        video: { video },
        title: "🔥 Join Chat – Special Offer!",
        desc: "Unlock premium features & startup rewards!",
        link: "https://clickship.in/products/mystery-box",
        cta: "Shop Now"
    }
};
