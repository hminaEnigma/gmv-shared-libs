/**
 * Injects a remote's own compiled global stylesheet (e.g. its Tailwind utility
 * classes) into the host document.
 *
 * Native Federation only wires up JS module loading via the import map -- a
 * remote's `angular.json` "styles" bundle (its own `styles.css`) never reaches
 * the page on its own, since only the host's `index.html` has a `<link>` tag
 * for it. Without this, any Tailwind/global CSS class a remote uses that the
 * host doesn't *also* happen to use gets silently dropped: the host's own
 * Tailwind build only emits utilities found in the host's own templates.
 *
 * Call this once from the remote's OWN exposed entry file (its
 * `federation.config.js` `exposes` target), never from a shared/federated
 * module: `baseUrl` must be derived from that entry file's own
 * `import.meta.url`. A `shareAll({ singleton: true })` package is loaded once
 * and reused by whichever participant (host or another remote) loaded it
 * first, so `import.meta.url` read from inside a shared chunk resolves to
 * that first loader's origin, not necessarily this remote's own.
 *
 * @example
 * // remote's own remote-entry.ts (NOT a shared file)
 * import { loadRemoteStyles } from '@gmv/ui-kit';
 * loadRemoteStyles(new URL('.', import.meta.url).href);
 */
export function loadRemoteStyles(baseUrl: string, fileName = 'styles.css'): void {
  const href = new URL(fileName, baseUrl).href;
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
