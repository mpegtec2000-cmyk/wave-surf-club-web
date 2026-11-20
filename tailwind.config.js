/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: '#D7F55A', soft: '#EEFBC0', deep: '#B8DD2E' },
        brand: {
          accent: '#FFFFFF',
          'accent-light': '#F4F4F5',
          'accent-dark': '#E4E4E7',
          black: '#000000',
          dark: '#171717',
          gray: '#262626',
          'gray-light': '#f8f9fa',
          'gray-mid': '#e5e7eb',
          white: '#FFFFFF',
          'off-white': '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '3xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};
