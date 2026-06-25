/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
      },
      opacity: {
        8: '0.08',
        45: '0.45',
        55: '0.55',
        85: '0.85',
      },
      colors: {
        // Earth-tone palette — warm ivory backgrounds, deep forest greens,
        // natural browns & stone, dark charcoal text.
        ivory: {
          DEFAULT: '#F6F2E8',
          50: '#FBF9F3',
          100: '#F6F2E8',
          200: '#EFE9DA',
          300: '#E4DCC6',
        },
        cream: {
          DEFAULT: '#EDE6D4',
          dark: '#E2D9C2',
        },
        stone: {
          DEFAULT: '#C8BDA7',
          light: '#D9D0BE',
          dark: '#A89E89',
        },
        bark: {
          DEFAULT: '#5A4A3A',
          light: '#7A6651',
          dark: '#3E3227',
        },
        charcoal: {
          DEFAULT: '#26241F',
          light: '#3A3833',
          soft: '#54514A',
        },
        forest: {
          DEFAULT: '#243B2C',
          light: '#33513E',
          deep: '#172619',
          mist: '#7E9A86',
        },
        moss: {
          DEFAULT: '#4E6B47',
          light: '#6B8A62',
        },
        sage: {
          DEFAULT: '#8A9A7B',
          light: '#A8B59B',
        },
        clay: {
          DEFAULT: '#9C6B4F',
          light: '#B58968',
        },
        ochre: {
          DEFAULT: '#B8893A',
        },
        sand: {
          DEFAULT: '#D8C9A8',
        },
      },
      fontFamily: {
        // Editorial serif for display headings: Latin leads, CJK falls back
        // to Noto Serif SC so Chinese titles stay elegant & breathable.
        serif: [
          'Playfair Display',
          'Cormorant Garamond',
          'Fraunces',
          'Noto Serif SC',
          'Source Han Serif SC',
          'Songti SC',
          'Georgia',
          'serif',
        ],
        // Clean sans for body: Latin leads, CJK falls back to PingFang SC
        // (Apple) then Noto Sans SC. Deliberately avoids YaHei/SimSun.
        sans: [
          'Inter',
          'PingFang SC',
          'Noto Sans SC',
          'Source Han Sans SC',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'Playfair Display',
          'Cormorant Garamond',
          'Fraunces',
          'Noto Serif SC',
          'Source Han Serif SC',
          'Songti SC',
          'Georgia',
          'serif',
        ],
      },
      letterSpacing: {
        'widest-2': '0.25em',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slow-pan': {
          '0%': { transform: 'scale(1.08) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.16) translate3d(-1.5%, -1.5%, 0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slow-pan': 'slow-pan 24s ease-in-out infinite alternate',
      },
      transitionTimingFunction: {
        organic: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
