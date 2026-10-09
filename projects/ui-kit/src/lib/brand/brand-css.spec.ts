import { buildBrandCss, buildFaviconDataUri } from './brand-css';
import { resolveBrand } from './brand.resolver';

describe('buildBrandCss', () => {
  const r = resolveBrand({ tenantName: 'Andes', primaryColor: '#0866FF' });
  const css = buildBrandCss(r);

  it('sobrescribe la paleta primaria de PrimeNG con especificidad alta', () => {
    expect(css).toContain(':root:root:root{');
    expect(css).toContain('--p-primary-500:#0866FF;');
    expect(css).toContain('--p-primary-50:');
    expect(css).toContain('--p-primary-950:');
    expect(css).toContain('--p-primary-contrast-color:#FFFFFF;');
  });

  it('define las variables --gmv-* dinámicas', () => {
    for (const name of ['--gmv-brand:', '--gmv-on-brand:', '--gmv-brand-text-light:', '--gmv-brand-text-dark:',
      '--gmv-brand-soft-light:', '--gmv-brand-soft-dark:', '--gmv-sidebar-bg-light:', '--gmv-sidebar-fg-light:',
      '--gmv-sidebar-fg-muted-light:', '--gmv-sidebar-active-bg-light:', '--gmv-secondary:', '--gmv-error:', '--gmv-font:']) {
      expect(css).withContext(name).toContain(name);
    }
  });

  it('ajusta el contraste del primario en modo oscuro (Aura usa primary.400)', () => {
    expect(css).toMatch(/:root:root\.app-dark\{--p-primary-contrast-color:#(FFFFFF|101828);\}/);
  });

  it('sanea la fuente para que no rompa el CSS', () => {
    const bad = buildBrandCss(resolveBrand({ tenantName: 'X', primaryColor: '#000000', fontFamily: "Inter;}body{display:none" }));
    expect(bad).toContain("--gmv-font:'Interbodydisplaynone';");
    expect(bad).not.toContain('display:none');
  });
});

describe('buildFaviconDataUri', () => {
  it('genera un SVG con la inicial escapada', () => {
    const uri = buildFaviconDataUri(resolveBrand({ tenantName: '<Andes>', primaryColor: '#0866FF' }));
    expect(uri.startsWith('data:image/svg+xml,')).toBeTrue();
    const svg = decodeURIComponent(uri.slice('data:image/svg+xml,'.length));
    expect(svg).toContain("fill='#0866FF'");
    expect(svg).toContain('>A</text>');
  });
});
