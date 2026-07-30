/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        glass: "32px",
      },
      boxShadow: {
        glass: "0 30px 80px -40px rgba(60,70,120,0.45), 0 4px 24px -8px rgba(60,70,120,0.18)",
        "glass-hover":
          "0 44px 100px -46px rgba(60,70,120,0.55), 0 8px 30px -8px rgba(60,70,120,0.22)",
        "glass-sm": "0 18px 50px -30px rgba(60,70,120,0.4)",
      },
      colors: {
        ink: {
          DEFAULT: "#1d1d1f",
          soft: "#3a3a3f",
          dim: "#6b6b73",
        },
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },
      keyframes: {
        marquee: {
          from: { transform: "translate3d(0,0,0)" },
          to: { transform: "translate3d(-50%,0,0)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        marquee: "marquee 44s linear infinite",
        floaty: "floaty 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
