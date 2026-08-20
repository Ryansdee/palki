import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identité Palki — dérivée du logo (mauve poudré + brun)
        porcelain: '#F5F0EF', // fond principal, greige chaud
        ink: '#362B27', // texte, brun profond
        mauve: '#A98CA3', // accent principal (le dais du logo)
        plum: '#6E4E63', // accent profond (hover / emphase)
        rose: '#D9A79B', // secondaire chaud, à doser
        sand: '#E7DEDA', // bordures, filets, cartes
        cloud: '#FBF9F8', // surfaces claires (cartes)
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-sans)', 'Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.35em',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
