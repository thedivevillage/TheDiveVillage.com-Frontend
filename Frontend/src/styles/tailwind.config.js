/** @type {import('tailwindcss').Config} */
export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#003865',
        accent: '#FFCD00',
        white: '#FFFFFF',
        cta: '#FF6106',
      },
      fontFamily: {
        heading: ['Antonio', 'sans-serif'],
        body: ['"Google Sans Flex"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        h1: ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '0.02em' }],
        h2: ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.25' }],
        h3: ['1.125rem', { lineHeight: '1.4' }],
        body: ['1rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        card: '14px',
        widget: '16px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 56, 101, 0.10)',
        card: '0 10px 28px rgba(0, 56, 101, 0.12)',
        lift: '0 16px 40px rgba(0, 56, 101, 0.18)',
        float: '0 20px 50px rgba(0, 56, 101, 0.16)',
        widget: '0 24px 60px rgba(0, 56, 101, 0.18)',
      },
      transitionDuration: {
        hover: '220ms',
        reveal: '500ms',
      },
    },
  },
  plugins: [],
}
