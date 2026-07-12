/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 32px rgba(14, 26, 22, 0.10)"
      },
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        chrome: "#0E1A16",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
        invest: {
          50: "#EAF3EC",
          100: "#CFE6D6",
          600: "#146B44",
          700: "#0F5636"
        },
        pass: {
          50: "#F5E9E7",
          100: "#E7CFC9",
          600: "#8B2E2E",
          700: "#6E2222"
        },
        brass: {
          50: "#F7F1E3",
          100: "#EDE0BE",
          500: "#A9853C",
          600: "#8F6E2E"
        }
      },
      fontFamily: {
        display: ['"Newsreader"', "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};



