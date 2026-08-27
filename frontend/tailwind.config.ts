import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#0052CC',
        'navy-dark': '#0A1C33',
        accent: {
          from: '#0052CC',
          to: '#1D72E8',
          DEFAULT: '#0052CC',
        },
        'page-bg': '#EEF3F8',
        'card-border': '#E1E7F0',
        'icon-bg': '#E1EDFF',
        'text-secondary': '#5A6E85',
        status: {
          success: '#00875A',
          'success-bg': '#E3FCEF',
          warning: '#FF8B00',
          'warning-bg': '#FFFAE6',
          error: '#DE350B',
          'error-bg': '#FFEBE6',
          neutral: '#6B778C',
          'neutral-bg': '#F4F5F7',
        },
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '8px',
      },
      textColor: {
        primary: '#0A1C33',
        secondary: '#5A6E85',
      },
      backgroundColor: {
        primary: '#FFFFFF',
        page: '#EEF3F8',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 6px 18px rgba(0, 82, 204, 0.12)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #0052CC, #1D72E8)',
      },
    },
  },
  plugins: [],
};

export default config;
