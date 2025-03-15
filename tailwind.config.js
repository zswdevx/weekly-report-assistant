const plugin = require("tailwindcss/plugin");

const spacing = {
  0: "0",
  1: "1px",
};
for (let i = 2; i <= 1920; i++) {
  if (i % 2 === 0) {
    spacing[i] = `${i}px`;
  }
}

const fontSize = {
  initial: "initial",
  inherit: "inherit",
};

for (let i = 0; i <= 48; i++) {
  if (i % 2 === 0) {
    fontSize[i + 12] = [`${i + 12}px`, `${i + 20}px`];
  }
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./src/**/*.tsx"],
  theme: {
    spacing,
    fontSize,
    borderRadius: {
      0: "0",
      2: "2px",
      4: "4px",
      6: "6px",
      8: "8px",
      12: "12px",
      DEFAULT: "16px",
      20: "20px",
      24: "24px",
      26: "26px",
      28: "28px",
      full: "9999px",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: {
        DEFAULT: "#262626",
      },
      white: {
        darkest: "#f0f0f0",
        dark: "#f5f5f5",
        DEFAULT: "#ffffff",
        light: "#fafafa",
      },
      blue: {
        DEFAULT: "#1890ff",
        lightest: "#e3f2ff",
      },
      yellow: {
        dark: "#fa8c16",
        DEFAULT: "#faad14",
        light: "#ffd591",
        lightest: "#fffbe6",
      },
      orange: {
        DEFAULT: "#ff6600",
        light: "#ff660D",
      },
      cyan: {
        DEFAULT: "#0fc6c2",
        lightest: "#f0f8ff",
      },
      green: {
        DEFAULT: "#52c41a",
      },
      red: {
        DEFAULT: "#ff4d4f",
      },
      gray: {
        darkest: "#8c8c8c",
        dark: "#bfbfbf",
        DEFAULT: "#595959",
        light: "#d9d9d9",
        lightest: "#e7e7e7",
      },
    },
    boxShadow: {
      xs: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
      sm: "0 0 12px 0 rgba(0, 0, 0, 0.1)",
      none: "none",
    },
    extend: {
      listStyleType: {
        circle: "circle",
      },
      lineHeight: {
        0: "0",
      },
      minHeight: spacing,
      minWidth: spacing,
      maxHeight: spacing,
      maxWidth: spacing,
      height: {
        initial: "initial",
        inherit: "inherit",
      },
      width: {
        initial: "initial",
        inherit: "inherit",
      },
    },
  },
  plugins: [
    plugin(({ addComponents, theme }) => {
      const wrap = {
        ".wrap": {
          padding: theme("padding.12"),
          "border-radius": theme("borderRadius.4"),
          "background-color": theme("colors.white.light"),
        },
      };
      const card = {
        ".card": {
          padding: theme("padding.24"),
          "border-radius": theme("borderRadius.8"),
          "background-color": theme("colors.white.DEFAULT"),
        },
      };
      const link = {
        ".link": {
          color: theme("colors.primary.DEFAULT"),
          cursor: "pointer",
          "user-select": "none",
        },
        ".link:hover": {
          opacity: theme("opacity.60"),
          color: theme("colors.primary"),
        },
      };
      addComponents([wrap, card, link]);
    }),
  ],
};
