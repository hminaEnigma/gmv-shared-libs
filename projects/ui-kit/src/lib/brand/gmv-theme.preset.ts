import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * Preset "suave" de GMV. El primario queda en azul provisional: en runtime lo reemplaza
 * GmvBrandService sobrescribiendo --p-primary-* (no se usa updatePrimaryPalette).
 */
export const GmvThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}', 100: '{blue.100}', 200: '{blue.200}', 300: '{blue.300}', 400: '{blue.400}', 500: '{blue.500}',
      600: '{blue.600}', 700: '{blue.700}', 800: '{blue.800}', 900: '{blue.900}', 950: '{blue.950}',
    },
    formField: { borderRadius: '10px' },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff', 50: '#f9fafb', 100: '#f5f6f8', 200: '#eaecf0', 300: '#d0d5dd', 400: '#98a2b3',
          500: '#667085', 600: '#475467', 700: '#344054', 800: '#1d2939', 900: '#101828', 950: '#0c111d',
        },
      },
      dark: {
        surface: {
          0: '#ffffff', 50: '#eceef2', 100: '#d5d9e0', 200: '#a3acbd', 300: '#7d879a', 400: '#5d6678',
          500: '#3f4757', 600: '#2a303c', 700: '#1f2430', 800: '#181d28', 900: '#12161f', 950: '#0b0e14',
        },
      },
    },
  },
  components: {
    button: { root: { borderRadius: '10px' } },
    card: { root: { borderRadius: '14px', shadow: 'var(--gmv-card-shadow)' } },
    // Mismo ajuste que AppThemeConfigurator: la opción seleccionada usa el primario.
    togglebutton: {
      colorScheme: {
        light: {
          root: { checkedColor: '{primary.contrast.color}' },
          content: { checkedBackground: '{primary.color}' },
          icon: { checkedColor: '{primary.contrast.color}' },
        },
        dark: {
          root: { checkedColor: '{primary.contrast.color}' },
          content: { checkedBackground: '{primary.color}' },
          icon: { checkedColor: '{primary.contrast.color}' },
        },
      },
    },
  },
});
