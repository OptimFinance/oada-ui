const base_colors = {
  background: "hsla(233, 100%, 4%, 1)",
  white: "hsla(0, 0%, 100%, 1)",
  black: "hsla(0, 0%, 0%, 1)",
  primary: "hsla(240, 94%, 68%, 1)",
  red: "hsla(3, 81%, 58%, 1)",
  yellow: "hsla(38, 80%, 67%, 1)",
  green: "hsla(138, 39%, 52%, 1)",
  purple: "hsla(241, 92%, 76%, 1)",
  transparent: "hsla(0, 0%, 0%, 0)",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        xs: '420px',
        md: '840px',
        fold: '1200px',
      }
    },
    colors: {
      ui: {
        base: base_colors,
        brand: {
          gradient: {
            start: "hsla(250, 100%, 72%, 1)",
            end: "hsla(227, 100%, 62%, 1)",
          },
        },
        background: {
          sub: "hsla(0, 0%, 100%, 0.04)",
          default: "hsla(0, 0%, 100%, 0.08)",
          hover: "hsla(0, 0%, 100%, 0.12)",
          active: "hsla(0, 0%, 100%, 0.16)",
          disabled: "hsla(0, 0%, 100%, 0.04)",
        },
        surface: {
          default: "hsla(0, 0%, 100%, 0.92)",
          sub: "hsla(0, 0%, 100%, 0.64)",
          disabled: "hsla(0, 0%, 100%, 0.4)",
          dark: "hsla(233, 100%, 4%, 0.9)",
          darksub: "hsla(233, 100%, 4%, 0.64)",
        },
        border: {
          sub: "hsla(0, 0%, 100%, 0.12)",
          default: "hsla(0, 0%, 100%, 0.16)",
          hover: "hsla(0, 0%, 100%, 0.24)",
          active: "hsla(0, 0%, 100%, 1)",
        },
        error: {
          default: base_colors.red,
          light: "hsla(5, 64%, 66%, 1)",
        },
        warning: {
          default: base_colors.yellow,
          light: "hsla(39, 69%, 77%, 1)",
        },
        success: {
          default: base_colors.green,
          light: "hsla(129, 32%, 65%, 1)",
        },
        info: {
          default: base_colors.purple,
          light: "hsla(234, 50%, 79%, 1)",
        },
      },
    },
  },

  plugins: [],
};
