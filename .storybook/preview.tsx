import type { Preview } from "@storybook/react";
import "../src/styles.css";

const preview: Preview = {
  globalTypes: {
    direction: {
      description: "Content direction",
      defaultValue: "ltr",
      toolbar: {
        title: "Direction",
        icon: "globe",
        items: [
          { value: "ltr", title: "English (LTR)" },
          { value: "rtl", title: "العربية (RTL)" },
        ],
      },
    },
    theme: {
      description: "Color theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div
        dir={context.globals.direction}
        data-theme={context.globals.theme}
        lang={context.globals.direction === "rtl" ? "ar" : "en"}
        className="acl-story"
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: {
      test: "error",
    },
    layout: "padded",
  },
};

export default preview;
