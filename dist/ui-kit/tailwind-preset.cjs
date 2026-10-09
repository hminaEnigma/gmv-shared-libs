/** Preset Tailwind de @gmv/ui-kit. Importar por ruta de archivo (no por `exports`) para que
 *  el shareAll de Native Federation no lo descubra como entry point. */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: 'var(--gmv-brand)', text: 'var(--gmv-brand-text)', soft: 'var(--gmv-brand-soft)', on: 'var(--gmv-on-brand)' },
        secondary: 'var(--gmv-secondary)',
        surface: { DEFAULT: 'var(--gmv-surface)', raised: 'var(--gmv-surface-raised)', bg: 'var(--gmv-bg)' },
        'gmv-text': { DEFAULT: 'var(--gmv-text)', muted: 'var(--gmv-text-muted)' },
        'gmv-border': 'var(--gmv-border)',
      },
      borderRadius: { 'gmv-sm': 'var(--gmv-radius-sm)', 'gmv-md': 'var(--gmv-radius-md)', 'gmv-lg': 'var(--gmv-radius-lg)' },
      boxShadow: { 'gmv-card': 'var(--gmv-card-shadow)' },
      fontFamily: { sans: ['var(--gmv-font)', 'Plus Jakarta Sans Variable', 'system-ui', 'sans-serif'] },
    },
  },
};
