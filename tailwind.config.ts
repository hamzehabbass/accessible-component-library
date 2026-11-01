import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "var(--acl-primary)",
        surface: "var(--acl-surface)",
        foreground: "var(--acl-foreground)",
        border: "var(--acl-border)",
        danger: "var(--acl-danger)",
      },
    },
  },
  plugins: [forms],
} satisfies Config;
