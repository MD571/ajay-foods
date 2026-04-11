import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:        'var(--primary)',
        'primary-mid':  'var(--primary-mid)',
        'primary-light':'var(--primary-light)',
        gold:           'var(--gold)',
        'gold-light':   'var(--gold-light)',
        'warm-bg':      'var(--bg)',
        surface:        'var(--surface)',
        'warm-border':  'var(--border)',
        'text-dark':    'var(--text-dark)',
        'text-mid':     'var(--text-mid)',
        'text-muted':   'var(--text-muted)',
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
