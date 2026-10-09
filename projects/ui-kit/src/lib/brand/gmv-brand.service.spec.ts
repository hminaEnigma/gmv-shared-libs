import { TestBed } from '@angular/core/testing';
import { BRAND_STYLE_ID } from './brand-css';
import { BRAND_CACHE_KEY, GMV_PLATFORM_BRAND } from './brand.tokens';
import { GmvBrandService } from './gmv-brand.service';

describe('GmvBrandService', () => {
  let service: GmvBrandService;
  const styleText = () => document.getElementById(BRAND_STYLE_ID)?.textContent ?? '';
  const favicon = () => document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ?? '';

  beforeEach(() => {
    localStorage.removeItem(BRAND_CACHE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(GmvBrandService);
  });

  afterEach(() => {
    document.getElementById(BRAND_STYLE_ID)?.remove();
    localStorage.removeItem(BRAND_CACHE_KEY);
  });

  it('apply escribe estilo, título, favicon, caché y señal', () => {
    service.apply({ tenantName: 'Andes', primaryColor: '#C2410C' });
    expect(styleText()).toContain('--p-primary-500:#C2410C;');
    expect(document.title).toBe('Andes');
    expect(favicon().startsWith('data:image/svg+xml')).toBeTrue();
    expect(JSON.parse(localStorage.getItem(BRAND_CACHE_KEY)!)).toEqual({ tenantName: 'Andes', primaryColor: '#C2410C' });
    expect(service.brand().tenantName).toBe('Andes');
  });

  it('apply reemplaza el estilo existente sin duplicarlo', () => {
    service.apply({ tenantName: 'A', primaryColor: '#C2410C' });
    service.apply({ tenantName: 'B', primaryColor: '#047857' });
    expect(document.querySelectorAll(`#${BRAND_STYLE_ID}`).length).toBe(1);
    expect(styleText()).toContain('--p-primary-500:#047857;');
  });

  it('apply con iconUrl usa ese favicon', () => {
    service.apply({ tenantName: 'A', primaryColor: '#0866FF', iconUrl: 'https://cdn.test/icon.png' });
    expect(favicon()).toBe('https://cdn.test/icon.png');
  });

  it('persist:false no toca la caché', () => {
    service.apply({ tenantName: 'Previa', primaryColor: '#047857' }, { persist: false });
    expect(localStorage.getItem(BRAND_CACHE_KEY)).toBeNull();
  });

  it('restoreCached aplica la caché válida', () => {
    localStorage.setItem(BRAND_CACHE_KEY, JSON.stringify({ tenantName: 'Cache', primaryColor: '#047857' }));
    service.restoreCached();
    expect(service.brand().tenantName).toBe('Cache');
    expect(styleText()).toContain('--p-primary-500:#047857;');
  });

  it('restoreCached con caché corrupta aplica la plataforma', () => {
    localStorage.setItem(BRAND_CACHE_KEY, '{no-json');
    service.restoreCached();
    expect(service.brand().tenantName).toBe('GMV');
    expect(styleText()).toContain('--p-primary-500:#0866FF;');
  });

  it('restoreCached sin caché aplica la plataforma', () => {
    service.restoreCached();
    expect(service.brand().primary).toBe('#0866FF');
  });

  it('reset borra la caché y aplica la plataforma', () => {
    service.apply({ tenantName: 'Andes', primaryColor: '#C2410C' });
    service.reset();
    expect(localStorage.getItem(BRAND_CACHE_KEY)).toBeNull();
    expect(service.brand().tenantName).toBe('GMV');
    expect(document.title).toBe('GMV');
  });

  it('si localStorage lanza, no falla', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('quota');
    spyOn(Storage.prototype, 'getItem').and.throwError('denied');
    spyOn(Storage.prototype, 'removeItem').and.throwError('denied');
    expect(() => service.apply({ tenantName: 'A', primaryColor: '#0866FF' })).not.toThrow();
    expect(() => service.restoreCached()).not.toThrow();
    expect(() => service.reset()).not.toThrow();
    // Restaurar antes del afterEach, que también usa localStorage.
    (Storage.prototype.setItem as jasmine.Spy).and.callThrough();
    (Storage.prototype.getItem as jasmine.Spy).and.callThrough();
    (Storage.prototype.removeItem as jasmine.Spy).and.callThrough();
  });
});

describe('GmvBrandService con GMV_PLATFORM_BRAND', () => {
  afterEach(() => document.getElementById(BRAND_STYLE_ID)?.remove());

  it('reset usa la marca de plataforma inyectada', () => {
    TestBed.configureTestingModule({ providers: [{ provide: GMV_PLATFORM_BRAND, useValue: { tenantName: 'Otra', primaryColor: '#047857' } }] });
    const service = TestBed.inject(GmvBrandService);
    service.reset();
    expect(service.brand().tenantName).toBe('Otra');
  });
});
