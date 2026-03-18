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
          DEFAULT: '#58595b',
          light: '#6d6e70',
          mid: '#808184',
        },
        amber: {
          DEFAULT: '#e31e24',
          light: '#ea4b50',
          muted: '#fde8e9',
        },
        'slate-blue': {
          DEFAULT: '#ffc600',
          light: '#fff4cc',
        },
        'off-white': '#f8fafc',
        border: '#e2e8f0',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
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
