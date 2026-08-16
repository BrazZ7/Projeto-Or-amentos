import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Superfícies do tema escuro, do fundo da página ao painel elevado.
        night: {
          950: '#05080f', // fundo da página
          900: '#080d18', // sidebar
          850: '#0b1120',
          800: '#0e1626', // painel
          700: '#131d31', // painel elevado / hover
          600: '#1a2540',
        },
        // Fio prateado das bordas. Bem mais claro que um cinza discreto: no
        // mockup é ele que "pega luz" e dá o aspecto de vidro polido.
        hairline: {
          DEFAULT: 'rgba(203, 213, 225, 0.22)',
          strong: 'rgba(226, 232, 240, 0.38)',
        },
        surface: {
          DEFAULT: '#0e1626',
          muted: '#0b1120',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 8px 24px -12px rgba(0, 0, 0, 0.6)',
        // Duas luzes internas — um filete branco no topo (specular) e um halo
        // frio embaixo — mais a sombra externa. É a combinação que faz o painel
        // parecer vidro polido em vez de um retângulo fosco.
        panel:
          'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 0 rgba(148, 163, 184, 0.06), 0 16px 40px -20px rgba(0, 0, 0, 0.9)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.07)',
        'glow-brand': '0 8px 28px -6px rgba(37, 99, 235, 0.55)',
        'glow-brand-lg': '0 0 0 1px rgba(59, 130, 246, 0.35), 0 12px 40px -8px rgba(37, 99, 235, 0.65)',
        'glow-soft': '0 0 24px -4px rgba(59, 130, 246, 0.35)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -6%) scale(1.08)' },
          '66%': { transform: 'translate(-3%, 4%) scale(0.95)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        sheen: {
          from: { transform: 'translateX(-150%) skewX(-20deg)' },
          to: { transform: 'translateX(150%) skewX(-20deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        'grow-x': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out backwards',
        'fade-in-up': 'fade-in-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        blob: 'blob 16s ease-in-out infinite',
        'blob-delay': 'blob 16s ease-in-out infinite 5s',
        'blob-delay-2': 'blob 20s ease-in-out infinite 2.5s',
        shimmer: 'shimmer 2.5s linear infinite',
        sheen: 'sheen 1.1s ease-in-out',
        float: 'float 5s ease-in-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'spin-slow': 'spin-slow 24s linear infinite',
        'glow-pulse': 'glow-pulse 3.5s ease-in-out infinite',
        'grow-x': 'grow-x 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
