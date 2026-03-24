/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      colors: {
        // Modern Deep Theme
        'brand-deep': '#020617',      // Background
        'brand-surface': '#0F172A',   // Cards / Surface
        'brand-border': '#1E293B',    // Borders
        'brand-primary': '#0D9488',   // Stable Teal
        'brand-vibrant': '#2DD4BF',   // Vibrant Cyan
        'brand-indigo': '#6366F1',    // Tech Trust
        'brand-rose': '#F43F5E',      // Care Accent
        'brand-amber': '#F59E0B',     // Highlight
        'brand-text': '#F8FAFC',      // Primary Text
        'brand-muted': '#94A3B8',     // Muted Text
        'brand-success': '#10B981',   // Success State
        
        // Keep existing for compatibility
        primary: "#0D9488",
        secondary: "#6366F1",
        'primary-action': '#0D9488',
        'background-color': '#020617',
      },
    },
  },
  plugins: [],
}
