/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Design system: black, deep green, neon green, restrained red
                brand: {
                    red: "#ef4444",
                    "red-hover": "#dc2626",
                    "red-light": "#FEF2F2",
                    green: "#16a34a",
                    "green-hover": "#15803d",
                    "green-light": "#F0FDF4",
                },
                surface: {
                    dark: "#0A0A0A",
                    "dark-card": "#0B100D",
                    "dark-border": "#24352A",
                    "dark-hover": "#111C15",
                    light: "#FAFAFA",
                    "light-card": "#FFFFFF",
                    "light-border": "#E5E7EB",
                    "light-hover": "#F3F4F6",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
