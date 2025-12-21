import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 深色科技感主題色系
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#b9e5fe",
          300: "#7cd3fd",
          400: "#36bffa",
          500: "#0ca5eb",
          600: "#0086c9",
          700: "#016aa3",
          800: "#065986",
          900: "#0b4a6f",
          950: "#072f49",
        },
        // 深灰色調 - 主背景
        slate: {
          850: "#1a1f2e",
          900: "#0f1219",
          925: "#0c0e14",
          950: "#080a0f",
        },
        // 強調色 - 科技藍
        accent: {
          cyan: "#06b6d4",
          blue: "#3b82f6",
          indigo: "#6366f1",
          purple: "#8b5cf6",
        },
        // 語意色彩
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        // 漸層背景
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0f1219 0%, #1a1f2e 50%, #0f1219 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "glow-gradient": "radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "glow-sm": "0 0 20px -5px rgba(6, 182, 212, 0.3)",
        "glow-md": "0 0 40px -10px rgba(6, 182, 212, 0.4)",
        "glow-lg": "0 0 60px -15px rgba(6, 182, 212, 0.5)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "typing": "typing 1s steps(3) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px -5px rgba(6, 182, 212, 0.3)" },
          "50%": { boxShadow: "0 0 40px -5px rgba(6, 182, 212, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        typing: {
          "0%": { opacity: "0.2" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.2" },
        },
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "rgba(255, 255, 255, 0.8)",
            "--tw-prose-headings": "#fff",
            "--tw-prose-links": "#06b6d4",
            "--tw-prose-code": "#06b6d4",
            "--tw-prose-pre-bg": "rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
