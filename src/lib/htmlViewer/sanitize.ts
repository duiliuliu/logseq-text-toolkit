export interface SanitizeHtmlOptions {
  allowScripts: boolean;
  allowRemote: boolean;
  baseUrl: string;
}

const REMOTE_PROTOCOL = /^(?:https?:)?\/\//i;

function isRemoteUrl(value: string): boolean {
  return REMOTE_PROTOCOL.test(value.trim());
}

function removeRemoteAttribute(element: Element, name: string): void {
  const value = element.getAttribute(name);
  if (value && isRemoteUrl(value)) {
    element.removeAttribute(name);
  }
}

function unwrap(element: Element): void {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  parent.removeChild(element);
}

/**
 * Prepare an attachment for a sandboxed, script-disabled srcdoc iframe.
 * This is deliberately conservative: third-party HTML must not be able to
 * navigate the host, phone home, or execute scripts unless the user opts in.
 */
export function sanitizeHtml(raw: string, options: SanitizeHtmlOptions): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/html');

  doc.querySelectorAll('script').forEach((element) => {
    if (!options.allowScripts) element.remove();
  });

  // Nested browsing contexts are never needed for a read-only attachment.
  doc.querySelectorAll('iframe, frame, frameset, object, embed, applet').forEach((element) => {
    element.remove();
  });

  doc.querySelectorAll('form').forEach(unwrap);

  doc.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (attribute.value.trim().toLowerCase().startsWith('javascript:')) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (!options.allowRemote && ['src', 'href', 'poster', 'action'].includes(name)) {
        removeRemoteAttribute(element, attribute.name);
      }
      if (!options.allowRemote && name === 'srcset') {
        element.removeAttribute(attribute.name);
      }
    }
  });

  if (!options.allowRemote) {
    doc.querySelectorAll('link[href]').forEach((element) => {
      removeRemoteAttribute(element, 'href');
    });
    doc.querySelectorAll('style').forEach((element) => {
      if (element.textContent) {
        element.textContent = element.textContent
          .replace(/@import\s+(?:url\()?['"]?https?:\/\/[^;)]+['"]?\)?;?/gi, '')
          .replace(/url\(\s*['"]?https?:\/\/[^)]+\)/gi, 'none');
      }
    });
  }

  // Prevent the attachment from replacing the reader via meta refresh.
  doc.querySelectorAll('meta[http-equiv]').forEach((element) => {
    if ((element.getAttribute('http-equiv') || '').toLowerCase() === 'refresh') {
      element.remove();
    }
  });

  // Make relative images/styles resolve against the attachment itself.
  doc.querySelectorAll('base').forEach((element) => element.remove());
  if (options.baseUrl) {
    const base = doc.createElement('base');
    base.setAttribute('href', options.baseUrl);
    doc.head.prepend(base);
  }

  const viewport = doc.querySelector('meta[name="viewport"]') || doc.createElement('meta');
  viewport.setAttribute('name', 'viewport');
  viewport.setAttribute('content', 'width=device-width, initial-scale=1');
  if (!viewport.parentNode) doc.head.appendChild(viewport);

  return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
}
