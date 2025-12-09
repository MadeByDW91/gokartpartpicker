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
        gpp: {
          bg: 'var(--gpp-bg)',
          'bg-soft': 'var(--gpp-bg-soft)',
          cream: 'var(--gpp-cream)',
          orange: 'var(--gpp-orange)',
          'orange-dark': 'var(--gpp-orange-dark)',
          text: 'var(--gpp-text-main)',
          'text-muted': 'var(--gpp-text-muted)',
          border: 'var(--gpp-border-subtle)',
          success: 'var(--gpp-success)',
          warning: 'var(--gpp-warning)',
          error: 'var(--gpp-error)',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
