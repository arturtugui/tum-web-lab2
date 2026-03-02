/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
  ],
  theme: {
    extend: {
      /* All project colors centralized as design tokens */
      colors: {
        'dark-almost-black': '#212a31',
        'gray': '#2e3944',
        'pale-light-gray': '#d3d8d9',
        'muted-gray-blue': '#748d92',
        'vivid-blue': '#124e66',
        'dark-blue': '#0a2f3f',
        'text-gray': '#838c90',
        'bluer-almost-dark': '#324a5f',
        'kitchen-bg': '#1e2c36',
        'furniture-bg': '#324946',
        'button-hover': '#1f3449',
        'footer-text': '#cfd8dc',
      },
      /* Custom breakpoint: original project uses 1200px for "desktop".
         Tailwind's built-in md (768px) covers "tablet". */
      screens: {
        'desktop': '1200px',
      },
      /* Custom font families used in the project */
      fontFamily: {
        'arial': ['Arial', 'sans-serif'],
        'verdana': ['Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

