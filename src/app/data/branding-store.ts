import { Injectable, signal } from '@angular/core';

export type DocumentTemplate = 'Professional' | 'Modern' | 'Minimal' | 'Elegant';

@Injectable({ providedIn: 'root' })
export class BrandingStore {
  private readonly templateKey = 'titan-template';
  private readonly colourKey = 'titan-brand-colour';
  private readonly logoKey = 'titan-company-logo';

  readonly template = signal<DocumentTemplate>(this.readTemplate());
  readonly brandColor = signal(localStorage.getItem(this.colourKey) || '#2563eb');
  readonly logo = signal(localStorage.getItem(this.logoKey) || '');

  setTemplate(template: DocumentTemplate) {
    this.template.set(template);
    localStorage.setItem(this.templateKey, template);
  }

  setBrandColor(colour: string) {
    this.brandColor.set(colour);
    localStorage.setItem(this.colourKey, colour);
  }

  setLogo(dataUrl: string) {
    this.logo.set(dataUrl);
    if (dataUrl) localStorage.setItem(this.logoKey, dataUrl);
    else localStorage.removeItem(this.logoKey);
  }

  private readTemplate(): DocumentTemplate {
    const saved = localStorage.getItem(this.templateKey);
    return ['Professional', 'Modern', 'Minimal', 'Elegant'].includes(saved || '')
      ? (saved as DocumentTemplate)
      : 'Professional';
  }
}
