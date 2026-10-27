import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "#faf7f2",
        ink: "#1f1b16",
        gold: "#b08d57",
      },
    },
  },
  plugins: [],
};

export default config;
