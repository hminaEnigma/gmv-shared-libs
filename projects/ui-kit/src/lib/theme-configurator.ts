import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const AppThemeConfigurator = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    },
    components: {
        // The default Aura toggle/select-button highlights the selected option with a plain
        // surface pill, which reads as barely-selected. Make the selected option use the
        // primary color so the active choice is obvious.
        togglebutton: {
            colorScheme: {
                light: {
                    root: { checkedColor: '{primary.contrast.color}' },
                    content: { checkedBackground: '{primary.color}' },
                    icon: { checkedColor: '{primary.contrast.color}' }
                },
                dark: {
                    root: { checkedColor: '{primary.contrast.color}' },
                    content: { checkedBackground: '{primary.color}' },
                    icon: { checkedColor: '{primary.contrast.color}' }
                }
            }
        }
    }
});

export default AppThemeConfigurator;
