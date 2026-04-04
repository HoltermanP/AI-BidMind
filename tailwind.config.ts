import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0d1428',
          light: '#1a2540',
          mid: '#2a3348',
        },
        amber: {
          DEFAULT: '#ff4d1c',
          light: '#ff7a55',
          muted: '#fff0eb',
        },
        'slate-blue': {
          DEFAULT: '#2d6fe8',
          light: '#e8f1ff',
        },
        'off-white': '#f4f6fa',
        border: '#e2e8f0',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'system-ui', 'sans-serif'],
        tagline: ['DM Sans', 'system-ui', 'sans-serif'],
        plex: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
    },
  },
  plugins: [],
}

export default config
