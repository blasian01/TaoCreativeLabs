import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: {
                    50: "#fafafa",
                    100: "#f5f5f5",
                    200: "#eeeeee",
                    300: "#e0e0e0",
                    400: "#bdbdbd",
                },
                ink: {
                    DEFAULT: "#1a1a1a",
                    light: "#333333",
                    muted: "#666666",
                },
                accent: {
                    DEFAULT: "#0a0a0a",
                    subtle: "#2a2a2a",
                },
                brand: {
                    violet: "#7c3aed",
                    "violet-light": "#a78bfa",
                    cyan: "#06b6d4",
                    "cyan-light": "#67e8f9",
                    amber: "#f59e0b",
                    rose: "#f43f5e",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                grotesk: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
            },
            spacing: {
                "18": "4.5rem",
                "88": "22rem",
                "128": "32rem",
            },
            backdropBlur: {
                xs: "2px",
            },
            animation: {
                "fade-in": "fadeIn 0.8s ease-out forwards",
                "slide-up": "slideUp 0.6s ease-out forwards",
                "grid-pulse": "gridPulse 4s ease-in-out infinite",
                "gradient-shift": "gradientShift 6s ease infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                gridPulse: {
                    "0%, 100%": { opacity: "0.3" },
                    "50%": { opacity: "0.6" },
                },
                gradientShift: {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
