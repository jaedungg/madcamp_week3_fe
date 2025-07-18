import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5856D6",
        "primary-2": "#7978DE",
        "primary-3": "#9B9AE6",
        "primary-4": "#BCBBEF",
        "primary-5": "#DEDDF7",
      },
    },
  },
  plugins: [],
};

export default config;
