import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { GmvBrandService } from './gmv-brand.service';

@Component({
  selector: 'gmv-brand-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gmv-brand-logo' },
  template: `
    @if (showImage()) {
      <img class="gmv-brand-logo-img" [src]="src()" [alt]="brand().tenantName" [style.height.px]="size()" (error)="failedSrc.set(src())" />
    } @else {
      <span class="gmv-brand-logo-initial" aria-hidden="true" [class.on-brand]="variant() === 'onBrand'"
            [style.width.px]="size()" [style.height.px]="size()" [style.font-size.px]="size() * 0.45">{{ brand().initial }}</span>
    }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; flex-shrink: 0; }
    .gmv-brand-logo-img { display: block; width: auto; max-width: 168px; object-fit: contain; }
    .gmv-brand-logo-initial {
      display: inline-grid; place-items: center; border-radius: var(--gmv-radius-md, 10px); font-weight: 800; line-height: 1;
      background: var(--gmv-brand); color: var(--gmv-on-brand);
    }
    .gmv-brand-logo-initial.on-brand { background: var(--gmv-sidebar-fg); color: var(--gmv-sidebar-bg); }
    :host-context(.app-dark) .gmv-brand-logo-initial.on-brand { background: var(--gmv-brand); color: var(--gmv-on-brand); }
  `],
})
export class GmvBrandLogoComponent {
  readonly variant = input<'onBrand' | 'onLight'>('onBrand');
  readonly size = input(36);

  protected readonly brand = inject(GmvBrandService).brand;
  protected readonly failedSrc = signal<string | null>(null);
  protected readonly src = computed(() => (this.variant() === 'onBrand' ? this.brand().logoOnBrand : this.brand().logoOnLight));
  protected readonly showImage = computed(() => !!this.src() && this.src() !== this.failedSrc());
}
