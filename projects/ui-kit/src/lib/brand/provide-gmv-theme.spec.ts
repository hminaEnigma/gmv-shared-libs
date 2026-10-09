import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BRAND_STYLE_ID } from './brand-css';
import { BRAND_CACHE_KEY } from './brand.tokens';
import { GmvBrandService } from './gmv-brand.service';
import { provideGmvTheme } from './provide-gmv-theme';

describe('provideGmvTheme', () => {
  afterEach(() => {
    document.getElementById(BRAND_STYLE_ID)?.remove();
    localStorage.removeItem(BRAND_CACHE_KEY);
  });

  it('restaura la marca en caché durante la inicialización', async () => {
    localStorage.setItem(BRAND_CACHE_KEY, JSON.stringify({ tenantName: 'Cache', primaryColor: '#047857' }));
    TestBed.configureTestingModule({ providers: provideGmvTheme() });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    expect(TestBed.inject(GmvBrandService).brand().tenantName).toBe('Cache');
  });

  it('acepta una marca de plataforma propia', async () => {
    TestBed.configureTestingModule({ providers: provideGmvTheme({ platformBrand: { tenantName: 'Neutra', primaryColor: '#334E7A' } }) });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    expect(TestBed.inject(GmvBrandService).brand().tenantName).toBe('Neutra');
  });
});
