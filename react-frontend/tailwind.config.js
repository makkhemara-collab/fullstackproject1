/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e293b",       // Slate 800 - Deep dark for sidebar
        accent: "#3b82f6",        // Blue 500 - Main action color
        "accent-hover": "#2563eb",// Blue 600
        "background-light": "#f8fafc", // Slate 50 - Main app background
        "background-dark": "#0f172a",  // Slate 900
        "text-main": "#1e293b",   // Slate 800 - Headings
        "text-muted": "#475569",  // Slate 600 - Body text (as requested!)
        "border-light": "#e2e8f0",// Slate 200
        "card-light": "#ffffff",  // Pure white for content cards
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [],
};