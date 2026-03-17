module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f2faea',
          100: '#e2f4d2',
          200: '#c4e8a5',
          300: '#a4d978',
          400: '#8ec96a',
          500: '#7cbd67',  // primary Ã¢â‚¬â€œ taupe
          600: '#629d51',
          700: '#4e7d3e',
          800: '#38592c',
          900: '#233a1b',
        },
        surface: {
          DEFAULT: '#111410',  // deep dark
          card:    '#171b14',
          border:  '#232b1e',
          hover:   '#1c2318',
          muted:   '#141810',
        },
        neutral: {
          800: '#1e2419',
          700: '#2e3828',
          600: '#455239',
          500: '#6b7a60',
          400: '#96a888',
          300: '#bfcdb5',
          200: '#dde6d8',
        },
        accent:  '#a4d978',
        success: '#bfcdb5',
        warning: '#8ec96a',
        danger:  '#EF4444',
      },
      fontFamily: {
        sans:    ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7cbd67 0%, #629d51 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #7cbd67 0%, #a4d978 100%)',
        'accent-gradient': 'linear-gradient(135deg, #629d51 0%, #4e7d3e 100%)',
      },
      boxShadow: {
        'brand':    '0 4px 24px rgba(124, 189, 103, 0.3)',
        'brand-lg': '0 8px 40px rgba(124, 189, 103, 0.45)',
        'card':     '0 1px 16px rgba(0,0,0,0.5)',
        'card-lg':  '0 4px 32px rgba(0,0,0,0.7)',
        'inner-brand': 'inset 0 0 0 1px rgba(124,189,103,0.2)',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}