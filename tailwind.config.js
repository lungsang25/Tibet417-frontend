/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        paper: '#FAF9F7',
        stone: '#8A8580',
        line: '#E5E2DD',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Prata', 'Georgia', 'serif'],
      },
      letterSpacing: {
        label: '0.2em',
      },
      transitionDuration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
        slower: '700ms',
      },
      boxShadow: {
        modal: '0 20px 60px -15px rgba(26, 26, 26, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'ken-burns': 'ken-burns 7s ease-out both',
      },
    },
  },
  plugins: [],
}
