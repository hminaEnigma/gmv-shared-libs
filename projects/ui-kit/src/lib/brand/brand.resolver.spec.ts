import { contrast } from './color.utils';
import { isBrandConfig, resolveBrand } from './brand.resolver';
import { DARK_SURFACE, PLATFORM_BRAND } from './brand.tokens';

describe('resolveBrand', () => {
  it('resuelve la marca de plataforma', () => {
    const r = resolveBrand(PLATFORM_BRAND);
    expect(r.tenantName).toBe('GMV');
    expect(r.initial).toBe('G');
    expect(r.primary).toBe('#0866FF');
    expect(r.palette[500]).toBe('#0866FF');
    expect(Object.keys(r.palette).length).toBe(11);
    expect(r.onBrand).toBe('#FFFFFF');
    expect(r.sidebarBg).toBe('#0866FF');
    expect(r.sidebarFg).toBe('#FFFFFF');
    expect(r.sidebarActiveBg).toBe('rgba(255,255,255,.16)');
    expect(r.fontFamily).toBe('Plus Jakarta Sans');
    expect(r.logoOnBrand).toBeNull();
  });

  it('marca amarilla: texto oscuro en sidebar y brand-text oscurecido', () => {
    const r = resolveBrand({ tenantName: 'Sol Amarillo', primaryColor: '#FACC15' });
    expect(r.sidebarFg).toBe('#101828');
    expect(r.sidebarFgMuted).toBe('rgba(16,24,40,.68)');
    expect(r.sidebarActiveBg).toBe('rgba(16,24,40,.10)');
    expect(r.onBrand).toBe('#101828');
    expect(contrast(r.brandTextLight, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(r.brandTextDark, DARK_SURFACE)).toBeGreaterThanOrEqual(4.5);
  });

  it('marca cian cumple contraste en ambos modos', () => {
    const r = resolveBrand({ tenantName: 'Cian', primaryColor: '#06B6D4' });
    expect(contrast(r.brandTextLight, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(r.brandTextDark, DARK_SURFACE)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(r.sidebarBg, r.sidebarFg)).toBeGreaterThanOrEqual(4.5);
  });

  it('hex inválido cae al de plataforma y avisa', () => {
    spyOn(console, 'warn');
    const r = resolveBrand({ tenantName: 'X', primaryColor: 'rojo', secondaryColor: '#12' });
    expect(r.primary).toBe('#0866FF');
    expect(r.secondary).toBe('#006A32');
    expect(console.warn).toHaveBeenCalledWith('[gmv-brand] invalid color', 'primaryColor', 'rojo');
  });

  it('usa sidebarColor y fontFamily cuando vienen', () => {
    const r = resolveBrand({ tenantName: 'Andes', primaryColor: '#0866FF', sidebarColor: '#0A3C9E', fontFamily: 'Inter' });
    expect(r.sidebarBg).toBe('#0A3C9E');
    expect(r.fontFamily).toBe('Inter');
  });

  it('inicial: primera letra o número, en mayúscula', () => {
    expect(resolveBrand({ tenantName: '  café la montaña', primaryColor: '#000000' }).initial).toBe('C');
    expect(resolveBrand({ tenantName: '3M Colombia', primaryColor: '#000000' }).initial).toBe('3');
    expect(resolveBrand({ tenantName: '', primaryColor: '#000000' }).tenantName).toBe('GMV');
  });

  it('logos: logoDarkUrl va sobre la marca, logoUrl sobre claro', () => {
    const r = resolveBrand({ tenantName: 'A', primaryColor: '#000000', logoUrl: 'https://x/l.png', logoDarkUrl: 'https://x/d.png' });
    expect(r.logoOnLight).toBe('https://x/l.png');
    expect(r.logoOnBrand).toBe('https://x/d.png');
  });
});

describe('isBrandConfig', () => {
  it('acepta un BrandConfig mínimo', () => expect(isBrandConfig({ tenantName: 'A', primaryColor: '#0866FF' })).toBeTrue());
  it('rechaza basura', () => {
    for (const v of [null, 1, 'x', {}, { tenantName: 'A' }, { tenantName: 'A', primaryColor: 'azul' }, { tenantName: 1, primaryColor: '#000000' }]) {
      expect(isBrandConfig(v)).withContext(JSON.stringify(v)).toBeFalse();
    }
  });
});
