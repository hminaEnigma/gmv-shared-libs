import { TestBed } from '@angular/core/testing';
import { BRAND_STYLE_ID } from './brand-css';
import { BRAND_CACHE_KEY } from './brand.tokens';
import { GmvBrandLogoComponent } from './brand-logo.component';
import { GmvBrandService } from './gmv-brand.service';

describe('GmvBrandLogoComponent', () => {
  let brand: GmvBrandService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GmvBrandLogoComponent] });
    brand = TestBed.inject(GmvBrandService);
  });

  afterEach(() => {
    document.getElementById(BRAND_STYLE_ID)?.remove();
    localStorage.removeItem(BRAND_CACHE_KEY);
  });

  it('muestra la inicial si no hay logo', () => {
    brand.apply({ tenantName: 'Andes', primaryColor: '#0866FF' });
    const fixture = TestBed.createComponent(GmvBrandLogoComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.gmv-brand-logo-initial')?.textContent?.trim()).toBe('A');
  });

  it('muestra el logo onBrand con alt = tenantName', () => {
    brand.apply({ tenantName: 'Andes', primaryColor: '#0866FF', logoDarkUrl: 'https://cdn.test/dark.png' });
    const fixture = TestBed.createComponent(GmvBrandLogoComponent);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toBe('https://cdn.test/dark.png');
    expect(img.alt).toBe('Andes');
  });

  it('variant onLight usa logoUrl', () => {
    brand.apply({ tenantName: 'Andes', primaryColor: '#0866FF', logoUrl: 'https://cdn.test/light.png', logoDarkUrl: 'https://cdn.test/dark.png' });
    const fixture = TestBed.createComponent(GmvBrandLogoComponent);
    fixture.componentRef.setInput('variant', 'onLight');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('https://cdn.test/light.png');
  });

  it('si la imagen falla (URL expirada) cae a la inicial', () => {
    brand.apply({ tenantName: 'Andes', primaryColor: '#0866FF', logoDarkUrl: 'https://cdn.test/expired.png' });
    const fixture = TestBed.createComponent(GmvBrandLogoComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.gmv-brand-logo-initial')).not.toBeNull();
  });

  it('una URL nueva vuelve a intentar la imagen', () => {
    brand.apply({ tenantName: 'Andes', primaryColor: '#0866FF', logoDarkUrl: 'https://cdn.test/expired.png' });
    const fixture = TestBed.createComponent(GmvBrandLogoComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    brand.apply({ tenantName: 'Andes', primaryColor: '#0866FF', logoDarkUrl: 'https://cdn.test/fresh.png' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('https://cdn.test/fresh.png');
  });
});
