import { EnvironmentProviders, Provider } from '@angular/core';
import { BrandConfig } from './brand.models';
/** Reemplaza providePrimeNG(...) en el shell: preset GMV + modo oscuro + marca restaurada antes del primer render. */
export declare function provideGmvTheme(opts?: {
    platformBrand?: BrandConfig;
}): (Provider | EnvironmentProviders)[];
