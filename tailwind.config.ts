import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5856D6",
        "primary-light": "#6f6de0",
        "primary-dark": "#3f3ca0",
      },
    },
  },
  plugins: [],
};

export default config;
