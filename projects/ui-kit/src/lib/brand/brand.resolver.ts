import { palette } from '@primeng/themes';
import { BrandConfig, PaletteScale, ResolvedBrand } from './brand.models';
import { DARK_SURFACE, DEFAULT_FONT, PLATFORM_BRAND } from './brand.tokens';
import { ensureContrast, mix, parseHex, pickOnColor, TEXT_ON_DARK } from './color.utils';

const SCALES: PaletteScale[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function resolveColor(field: string, value: string | undefined, fallback: string): string {
  const parsed = parseHex(value);
  if (value != null && value !== '' && !parsed) console.warn('[gmv-brand] invalid color', field, value);
  return parsed ?? parseHex(fallback) ?? '#0866FF';
}

function buildPalette(primary: string): Record<PaletteScale, string> {
  const raw = palette(primary) as Record<string, string>;
  return SCALES.reduce((acc, scale) => {
    acc[scale] = parseHex(raw[scale]) ?? raw[scale];
    return acc;
  }, {} as Record<PaletteScale, string>);
}

export function resolveBrand(config: BrandConfig, platform: BrandConfig = PLATFORM_BRAND): ResolvedBrand {
  const tenantName = config.tenantName?.trim() || platform.tenantName;
  const initial = (tenantName.match(/[\p{L}\p{N}]/u)?.[0] ?? 'G').toUpperCase();
  const primary = resolveColor('primaryColor', config.primaryColor, platform.primaryColor);
  const sidebarBg = config.sidebarColor ? resolveColor('sidebarColor', config.sidebarColor, primary) : primary;
  const sidebarFg = pickOnColor(sidebarBg);
  const lightSidebarText = sidebarFg === TEXT_ON_DARK;

  return {
    tenantName,
    initial,
    primary,
    palette: buildPalette(primary),
    onBrand: pickOnColor(primary),
    brandTextLight: ensureContrast(primary, '#FFFFFF'),
    brandTextDark: ensureContrast(primary, DARK_SURFACE),
    brandSoftLight: mix(primary, '#FFFFFF', 0.88),
    brandSoftDark: mix(primary, DARK_SURFACE, 0.82),
    sidebarBg,
    sidebarFg,
    sidebarFgMuted: lightSidebarText ? 'rgba(255,255,255,.72)' : 'rgba(16,24,40,.68)',
    sidebarActiveBg: lightSidebarText ? 'rgba(255,255,255,.16)' : 'rgba(16,24,40,.10)',
    secondary: resolveColor('secondaryColor', config.secondaryColor, platform.secondaryColor ?? '#006A32'),
    error: resolveColor('errorColor', config.errorColor, platform.errorColor ?? '#D92D20'),
    logoOnLight: config.logoUrl || null,
    logoOnBrand: config.logoDarkUrl || null,
    iconUrl: config.iconUrl || null,
    fontFamily: config.fontFamily?.trim() || DEFAULT_FONT,
  };
}

export function isBrandConfig(value: unknown): value is BrandConfig {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v['tenantName'] === 'string' && typeof v['primaryColor'] === 'string' && parseHex(v['primaryColor'] as string) !== null;
}
