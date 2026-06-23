/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "hsl(20, 8%, 5%)",
          900: "hsl(20, 8%, 8%)",
          800: "hsl(20, 6%, 12%)",
          700: "hsl(20, 5%, 16%)",
          600: "hsl(20, 4%, 22%)",
          500: "hsl(20, 3%, 30%)",
        },

        ash: {
          50: "hsl(30, 10%, 92%)",
          100: "hsl(30, 8%, 82%)",
          200: "hsl(30, 6%, 62%)",
          300: "hsl(30, 4%, 45%)",
          400: "hsl(30, 3%, 32%)",
        },

        ember: {
          300: "hsl(28, 65%, 65%)",
          400: "hsl(22, 75%, 58%)",
          500: "hsl(18, 80%, 50%)",
          600: "hsl(14, 85%, 42%)",
        },

        // collection colors
        "col-savor": "hsl(38, 70%, 52%)",
        "col-eventually": "hsl(30, 15%, 45%)",
        "col-unscripted": "hsl(4, 55%, 55%)",
        "col-wanderlust": "hsl(175, 30%, 45%)",
        "col-stage-lights": "hsl(45, 75%, 55%)",
        "col-in-between": "hsl(280, 20%, 50%)",
        "col-arcade": "hsl(140, 30%, 45%)",
        "col-frequencies": "hsl(25, 60%, 48%)",
        "col-refuge": "hsl(350, 55%, 48%)",
      },

      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Bensoon", "Inter", "system-ui", "sans-serif"],
      },

      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        xl: "28px",
      },

      boxShadow: {
        card: "0 2px 12px hsla(20, 80%, 8%, 0.4)",
        "card-hover": "0 4px 24px hsla(20, 80%, 50%, 0.12)",
        nav: "0 4px 32px hsla(0, 0%, 0%, 0.5)",
        modal: "0 8px 64px hsla(0, 0%, 0%, 0.7)",
        "ember-glow":
          "0 0 20px hsla(20, 80%, 50%, 0.20), 0 0 60px hsla(20, 80%, 50%, 0.08)",
        "mini-player": "0 4px 24px hsla(0, 0%, 0%, 0.6)",
      },

      spacing: {
        page: "clamp(24px, 5vw, 80px)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },

        "drift-up": {
          from: {
            opacity: "0",
            transform: "translateY(16px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        "drift-down": {
          from: {
            opacity: "0",
            transform: "translateY(-12px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsla(20, 80%, 50%, 0.15)",
          },
          "50%": {
            boxShadow: "0 0 30px hsla(20, 80%, 50%, 0.30)",
          },
        },

        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },

        shake: {
          "0%,100%": {
            transform: "translateX(0)",
          },
          "20%,60%": {
            transform: "translateX(-4px)",
          },
          "40%,80%": {
            transform: "translateX(4px)",
          },
        },
      },

      animation: {
        "fade-in":
          "fade-in 500ms cubic-bezier(0,0,0.2,1) forwards",

        "drift-up":
          "drift-up 600ms cubic-bezier(0.25,0.1,0.25,1) forwards",

        "drift-down":
          "drift-down 500ms cubic-bezier(0,0,0.2,1) forwards",

        "glow-pulse":
          "glow-pulse 3s cubic-bezier(0.4,0,0.2,1) infinite",

        "scale-in":
          "scale-in 300ms cubic-bezier(0,0,0.2,1) forwards",

        shake: "shake 400ms ease",
      },
    },
  },
  plugins: [],
};