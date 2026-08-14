/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2A4A", // primary — deep academic navy
        "ink-dark": "#101B30",
        brass: "#B08D57", // accent — brass/gold, seal & rule color
        "brass-light": "#D8C39C",
        paper: "#F7F6F2", // background — warm paper white
        charcoal: "#22262B", // body text
        slate: "#5B6472", // secondary text
        line: "#E4E1D8", // hairline dividers
        success: "#3F7A52",
        danger: "#A6432F",
        warn: "#B4832A",
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
