import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--navy)',
        'navy-deep': 'var(--navy-deep)',
        'navy-soft': 'var(--navy-soft)',
        wine: 'var(--wine)',
        'wine-deep': 'var(--wine-deep)',
        'wine-soft': 'var(--wine-soft)',
        sand: 'var(--sand)',
        'sand-soft': 'var(--sand-soft)',
        ivory: 'var(--ivory)',
        paper: 'var(--paper)',
        'paper-muted': 'var(--paper-muted)',
        sage: 'var(--sage)',
        'sage-soft': 'var(--sage-soft)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        muted: 'var(--muted)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'var(--line)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
} satisfies Config
