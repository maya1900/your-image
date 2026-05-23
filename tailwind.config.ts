import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0F',
        carbon: '#0F0F16',
        slate: {
          card: '#14141C',
          raised: '#1A1A24',
        },
        hairline: {
          DEFAULT: '#1F1F2A',
          subtle: 'rgba(255,255,255,0.06)',
        },
        ink: {
          DEFAULT: '#F4F4F7',
          mist: '#A1A1AA',
          faded: '#71717A',
          disabled: '#3F3F46',
        },
        aurora: {
          violet: '#8B5CF6',
          fuchsia: '#D946EF',
          soft: 'rgba(139,92,246,0.12)',
          ring: 'rgba(217,70,239,0.35)',
        },
        status: {
          ok: '#10B981',
          warn: '#F59E0B',
          err: '#EF4444',
          info: '#22D3EE',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          'Source Han Sans CN',
          'Microsoft YaHei',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        h1: ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        h2: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        h3: ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.55' }],
        body: ['0.875rem', { lineHeight: '1.55' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
        overline: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 16px rgba(0,0,0,0.4)',
        pop: '0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        focus: '0 0 0 3px rgba(217,70,239,0.18)',
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
        'skeleton-sheen':
          'linear-gradient(90deg, transparent, rgba(34,211,238,0.08), transparent)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sheen: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        sheen: 'sheen 2s linear infinite',
        breathe: 'breathe 1.6s ease-in-out infinite alternate',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
} satisfies Config;
