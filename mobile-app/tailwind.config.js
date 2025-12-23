/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", './node_modules/@wallet-ui/tailwind/index.css'],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        accent: '#6366f1',
        muted: '#64748b',
        surface: '#f1f5f9',
        border: '#e6edf3',
        success: '#10b981',
        destructive: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem'
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}
