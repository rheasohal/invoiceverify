export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['Geist', 'sans-serif'],
      },
      colors: {
        cream: { DEFAULT: '#F5F0E8', dark: '#EDE6D6', deep: '#E0D8C8' },
        navy: { DEFAULT: '#1E3A5F', mid: '#2D5282', light: '#EBF2FA' },
        forest: { DEFAULT: '#2D5016', mid: '#3D6B1F', light: '#EAF3DE' },
        sienna: { DEFAULT: '#9A3412', mid: '#C2410C', light: '#FEF0E8' },
        amber: { DEFAULT: '#92400E', mid: '#D97706', light: '#FFFBEB' },
      },
    },
  },
  plugins: [],
}