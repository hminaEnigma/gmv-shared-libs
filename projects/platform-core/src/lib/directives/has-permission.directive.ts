import { Directive, effect, inject, Input, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
    selector: '[hasPermission]',
    standalone: true
})
export class HasPermissionDirective {
    private readonly permissionService = inject(PermissionService);
    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainer = inject(ViewContainerRef);
    private hasView = false;
    private readonly _required = signal<string[]>([]);

    constructor() {
        effect(() => {
            const required = this._required();
            const hasAccess = this.permissionService.hasAnyPermission(required);
            if (hasAccess && !this.hasView) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.hasView = true;
            } else if (!hasAccess && this.hasView) {
                this.viewContainer.clear();
                this.hasView = false;
            }
        });
    }

    @Input()
    set hasPermission(value: string | string[]) {
        this._required.set(Array.isArray(value) ? value : [value]);
    }
}
