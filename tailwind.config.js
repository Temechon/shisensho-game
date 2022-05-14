module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {

      colors: {
        'board-green': '#78D9B2',
        'board-purple': '#a78bfa',
      },

      fontFamily: {
        sans: ['Jost', 'sans-serif'],
        display: ['Jost', 'sans-serif']
      }
    },
  },
  plugins: [],
}
