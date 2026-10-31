import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuotationStore, CustomField, ProductTemplate } from '../../data/quotation-store';
import { PrototypeStore } from '../../data/prototype-store';
@Component({
  selector: 'app-quote-settings',
  imports: [FormsModule],
  templateUrl: './quote-settings.html',
  styleUrl: './quote-settings.css',
})
export class QuoteSettingsPage {
  protected qs = inject(QuotationStore);
  protected toast = inject(PrototypeStore);
  protected defaultSubject = 'Quotation {{quote_number}} from Acme Trading Ltd';
  protected defaultMessage = 'Hello {{customer_name}},\n\nPlease find attached quotation {{quote_number}}.';
  protected tab = signal('Custom Fields');
  protected fieldQuery = signal('');
  protected filteredFields = computed(() => {
    const query = this.fieldQuery().trim().toLowerCase();
    return this.qs.fields().filter((field) =>
      `${field.label} ${field.type} ${field.section} ${field.options.join(' ')}`.toLowerCase().includes(query),
    );
  });
  protected fieldModal = signal(false);
  protected templateModal = signal(false);
  protected editing = signal<CustomField>({
    id: '',
    label: '',
    type: 'Short text',
    section: 'Product specifications',
    required: false,
    pdf: true,
    enabled: true,
    options: [],
  });
  protected editingTemplate = signal<ProductTemplate>({
    id: '',
    name: '',
    category: '',
    fields: [],
    published: false,
  });
  protected tabs = [
    'General',
    'Custom Fields',
    'Product Templates',
    'VAT / Tax',
    'PDF / Branding',
    'Email',
  ];
  protected types = [
    'Short text',
    'Long text',
    'Integer',
    'Decimal',
    'Measurement',
    'Dropdown',
    'Multi-select',
    'Radio group',
    'Checkbox',
    'Colour',
    'Date',
  ];
  protected editField(f?: CustomField) {
    this.editing.set(
      f
        ? structuredClone(f)
        : {
            id: crypto.randomUUID(),
            label: '',
            type: 'Short text',
            section: 'Product specifications',
            required: false,
            pdf: true,
            enabled: true,
            options: [],
          },
    );
    this.fieldModal.set(true);
  }
  protected update<K extends keyof CustomField>(key: K, value: CustomField[K]) {
    this.editing.update((f) => ({ ...f, [key]: value }));
  }
  protected setOptions(value: string) {
    this.update(
      'options',
      value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    );
  }
  protected toggleSettingField(field: CustomField, key: 'required' | 'pdf' | 'enabled') {
    this.qs.saveField({ ...field, [key]: !field[key] });
  }
  protected fieldName(id: string) {
    return this.qs.fields().find((f) => f.id === id)?.label || 'Retired field';
  }
  protected saveField() {
    if (!this.editing().label.trim()) {
      this.toast.notify('Field label is required');
      return;
    }
    this.qs.saveField(this.editing());
    this.fieldModal.set(false);
    this.toast.notify('Custom field saved');
  }
  protected duplicate(f: CustomField) {
    this.qs.saveField({ ...structuredClone(f), id: crypto.randomUUID(), label: `${f.label} copy` });
    this.toast.notify('Field duplicated');
  }
  protected editTemplate(t?: ProductTemplate) {
    this.editingTemplate.set(
      t
        ? structuredClone(t)
        : { id: crypto.randomUUID(), name: '', category: '', fields: [], published: false },
    );
    this.templateModal.set(true);
  }
  protected toggleField(id: string) {
    this.editingTemplate.update((t) => ({
      ...t,
      fields: t.fields.includes(id) ? t.fields.filter((x) => x !== id) : [...t.fields, id],
    }));
  }
  protected updateTemplate<K extends keyof ProductTemplate>(key: K, value: ProductTemplate[K]) {
    this.editingTemplate.update((t) => ({ ...t, [key]: value }));
  }
  protected saveTemplate() {
    if (!this.editingTemplate().name.trim()) {
      this.toast.notify('Template name is required');
      return;
    }
    this.qs.saveTemplate(this.editingTemplate());
    this.templateModal.set(false);
    this.toast.notify('Product template saved and versioned');
  }
}
