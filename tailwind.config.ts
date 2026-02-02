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
        // Base palette from UI_DESIGN_GUIDE.md
        background: '#000000', // Pure Black
        surface: '#0A0A0A',   // Near-Black
        accent: '#FFFFFF',    // Pure White
        // Semantic colors
        success: '#00FF88',   // Neon Green
        warning: '#FFCC00',   // Caution Yellow
        error: '#FF3366',     // Pink-Red
        // Text & Elements
        'text-primary': '#FFFFFF',
        'text-secondary': '#666666',
        divider: '#1A1A1A',
      },
      fontFamily: {
        // Primary font: Inter
        sans: ['Inter', 'sans-serif'],
        // Monospace for technical data
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Text styles mapping
        'app-title': ['20px', { lineHeight: '1.2', fontWeight: '900', letterSpacing: '2px' }],
        'status-label': ['10px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '1.2px' }],
        'section-header': ['12px', { lineHeight: '1.2', fontWeight: '900', letterSpacing: '2px' }],
        'body-strong': ['15px', { lineHeight: '1.5', fontWeight: '600' }],
        'body-secondary': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'button-label': ['14px', { lineHeight: '1.2', fontWeight: '900', letterSpacing: '1.5px' }],
      },
      borderRadius: {
        'card': '12px',
        'button-main': '16px',
        'button-secondary': '12px',
        'input': '12px',
      },
      spacing: {
        'micro': '4px',
        'base': '8px',
        'double': '16px',
        'quad': '32px',
      },
      borderWidth: {
        'hairline': '1px',
      },
      opacity: {
        '05': '0.05',
        '10': '0.10',
        '30': '0.30',
        '50': '0.50',
      },
    },
  },
  plugins: [],
}
export default config