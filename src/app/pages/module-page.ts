import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrototypeStore } from '../data/prototype-store';
import { BrandingStore, DocumentTemplate } from '../data/branding-store';
import {
  BLIND_FAMILIES,
  CONFIGURABLE_SPECS,
  DEFAULT_BLIND_CONFIG,
  BlindProductConfig,
} from '../data/blind-config';
type Row = Record<string, any>;
type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: string[];
};
const MODULES: Record<
  string,
  {
    title: string;
    singular: string;
    description: string;
    icon: string;
    fields: Field[];
    rows: Row[];
  }
> = {
  customers: {
    title: 'Customers',
    singular: 'Customer',
    description: 'Manage customer relationships, billing details and activity.',
    icon: '♙',
    fields: [
      { key: 'name', label: 'Customer name' },
      { key: 'email', label: 'Email' },
      { key: 'country', label: 'Country' },
      { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'GBP', 'EUR', 'INR'] },
      {
        key: 'terms',
        label: 'Payment terms',
        type: 'select',
        options: ['Due on receipt', 'Net 15', 'Net 30', 'Net 45'],
      },
    ],
    rows: [
      {
        id: 'CUS-001',
        name: 'Global Tech Ltd',
        email: 'billing@globaltech.demo',
        country: 'United Kingdom',
        currency: 'GBP',
        terms: 'Net 30',
        status: 'Active',
      },
      {
        id: 'CUS-002',
        name: 'Horizon Solutions',
        email: 'accounts@horizon.demo',
        country: 'United States',
        currency: 'USD',
        terms: 'Net 15',
        status: 'Active',
      },
      {
        id: 'CUS-003',
        name: 'Northstar Retail',
        email: 'finance@northstar.demo',
        country: 'Canada',
        currency: 'USD',
        terms: 'Net 30',
        status: 'Active',
      },
      {
        id: 'CUS-004',
        name: 'Apex Industries',
        email: 'payables@apex.demo',
        country: 'Germany',
        currency: 'EUR',
        terms: 'Net 45',
        status: 'Inactive',
      },
    ],
  },
  products: {
    title: 'Products & Services',
    singular: 'Product',
    description: 'Maintain products, services, pricing and tax defaults.',
    icon: '▣',
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'sku', label: 'SKU' },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: ['Hardware', 'Software', 'Service', 'Support'],
      },
      { key: 'price', label: 'Selling price', type: 'number' },
      {
        key: 'tax',
        label: 'Tax profile',
        type: 'select',
        options: ['VAT 20%', 'VAT 5%', 'GST 10%', 'Zero Rated'],
      },
    ],
    rows: [
      {
        id: 'PRD-101',
        name: 'Laptop Pro 16”',
        sku: 'LP-16-PRO',
        category: 'Hardware',
        price: 1200,
        tax: 'VAT 20%',
        status: 'Active',
      },
      {
        id: 'PRD-BLIND-ROLLER',
        name: 'Premium Blackout Roller Blind',
        sku: 'BL-RLR-BLK',
        category: 'Hardware',
        price: 520,
        tax: 'VAT 20%',
        status: 'Active',
        customSpecs: true,
        blindConfig: structuredClone(DEFAULT_BLIND_CONFIG),
      },
      {
        id: 'PRD-102',
        name: 'Wireless Mouse',
        sku: 'WM-ERG-01',
        category: 'Hardware',
        price: 25,
        tax: 'VAT 20%',
        status: 'Active',
      },
      {
        id: 'SRV-201',
        name: 'Setup Service',
        sku: 'SVC-SETUP',
        category: 'Service',
        price: 150,
        tax: 'Zero Rated',
        status: 'Active',
      },
      {
        id: 'SRV-202',
        name: 'Cloud Support Plan',
        sku: 'SUP-ANNUAL',
        category: 'Support',
        price: 850,
        tax: 'VAT 20%',
        status: 'Active',
      },
    ],
  },
  payments: {
    title: 'Payments',
    singular: 'Payment',
    description: 'Track invoice payments, methods and transaction references.',
    icon: '＄',
    fields: [
      { key: 'customer', label: 'Customer' },
      { key: 'invoice', label: 'Invoice reference' },
      { key: 'amount', label: 'Amount', type: 'number' },
      {
        key: 'method',
        label: 'Payment method',
        type: 'select',
        options: ['Bank Transfer', 'Credit Card', 'Cash', 'PayPal'],
      },
      { key: 'reference', label: 'Transaction reference' },
    ],
    rows: [
      {
        id: 'PAY-0089',
        customer: 'Horizon Solutions',
        invoice: 'INV-2026-0125',
        amount: 5240,
        method: 'Bank Transfer',
        reference: 'BACS-88421',
        status: 'Completed',
      },
      {
        id: 'PAY-0088',
        customer: 'Global Tech Ltd',
        invoice: 'INV-2026-0126',
        amount: 1600,
        method: 'Credit Card',
        reference: 'CC-019284',
        status: 'Completed',
      },
      {
        id: 'PAY-0087',
        customer: 'Northstar Retail',
        invoice: 'INV-2026-0119',
        amount: 2850,
        method: 'PayPal',
        reference: 'PP-77192',
        status: 'Completed',
      },
      {
        id: 'PAY-0086',
        customer: 'Apex Industries',
        invoice: 'INV-2026-0117',
        amount: 940,
        method: 'Bank Transfer',
        reference: 'SEPA-49211',
        status: 'Pending',
      },
    ],
  },
  taxes: {
    title: 'Tax Management',
    singular: 'Tax Profile',
    description: 'Configure reusable international tax profiles and calculations.',
    icon: '⚙',
    fields: [
      { key: 'name', label: 'Tax name' },
      { key: 'jurisdiction', label: 'Jurisdiction' },
      { key: 'rate', label: 'Rate (%)', type: 'number' },
      { key: 'method', label: 'Calculation', type: 'select', options: ['Exclusive', 'Inclusive'] },
      { key: 'effective', label: 'Effective date' },
    ],
    rows: [
      {
        id: 'TAX-01',
        name: 'Standard VAT',
        jurisdiction: 'United Kingdom',
        rate: 20,
        method: 'Exclusive',
        effective: '01 Jan 2026',
        status: 'Active',
      },
      {
        id: 'TAX-02',
        name: 'Reduced VAT',
        jurisdiction: 'United Kingdom',
        rate: 5,
        method: 'Exclusive',
        effective: '01 Jan 2026',
        status: 'Active',
      },
      {
        id: 'TAX-03',
        name: 'GST',
        jurisdiction: 'Australia',
        rate: 10,
        method: 'Inclusive',
        effective: '01 Jul 2026',
        status: 'Active',
      },
      {
        id: 'TAX-04',
        name: 'Zero Rated',
        jurisdiction: 'International',
        rate: 0,
        method: 'Exclusive',
        effective: '01 Jan 2026',
        status: 'Active',
      },
    ],
  },
};
@Component({
  selector: 'app-module',
  imports: [FormsModule],
  templateUrl: './module-page.html',
  styleUrl: './module-page.css',
})
export class ModulePage {
  protected store = inject(PrototypeStore);
  protected branding = inject(BrandingStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected slug =
    this.route.snapshot.data['section'] ||
    this.route.snapshot.paramMap.get('section') ||
    'customers';
  protected config = MODULES[this.slug];
  protected search = signal('');
  protected status = signal('All statuses');
  protected modal = signal(false);
  protected detail = signal<Row | null>(null);
  protected editing = signal<Row>({});
  protected activeTab = signal('Business profile');
  protected report = signal('Sales summary');
  protected reportRange = signal('This year');
  protected template = this.branding.template;
  protected brandColor = this.branding.brandColor;
  protected logo = this.branding.logo;
  protected savedSettings = signal(false);
  protected rows = signal<Row[]>(this.loadRows());
  protected filtered = computed(() =>
    this.rows().filter(
      (r) =>
        Object.values(r).join(' ').toLowerCase().includes(this.search().toLowerCase()) &&
        (this.status() === 'All statuses' || r['status'] === this.status()),
    ),
  );
  protected title =
    this.config?.title ||
    (
      {
        reports: 'Reports & Analytics',
        branding: 'Branding & Templates',
        settings: 'Settings',
      } as Record<string, string>
    )[this.slug] ||
    'Workspace';
  protected description =
    this.config?.description ||
    (
      {
        reports: 'Analyse revenue, sales, taxes and outstanding balances.',
        branding: 'Control your business identity and document presentation.',
        settings: 'Configure your organisation, users, currencies and preferences.',
      } as Record<string, string>
    )[this.slug] ||
    '';
  protected reportNames = [
    'Sales summary',
    'Invoice register',
    'Quotation register',
    'Outstanding invoices',
    'Customer-wise sales',
    'Product-wise sales',
    'Payment register',
    'Tax collected',
  ];
  protected templates = ['Professional', 'Modern', 'Minimal', 'Elegant'];
  protected blindFamilies = BLIND_FAMILIES;
  protected configurableSpecs = CONFIGURABLE_SPECS;
  protected settingsTabs = [
    'Business profile',
    'Legal entities',
    'Users',
    'Roles & permissions',
    'Currencies',
    'Document numbering',
    'Payment methods',
    'Email settings',
    'Subscription',
  ];
  constructor() {
    effect(() => {
      if (this.slug === 'reports' && this.report() === 'Invoice register')
        this.router.navigate(['/reports/accounting/invoice-register']);
    });
    this.route.paramMap.subscribe((params) => {
      const nextSlug = this.route.snapshot.data['section'] || params.get('section') || 'customers';
      if (nextSlug === this.slug) return;
      this.slug = nextSlug;
      this.config = MODULES[nextSlug];
      this.title =
        this.config?.title ||
        (
          {
            reports: 'Reports & Analytics',
            branding: 'Branding & Templates',
            settings: 'Settings',
          } as Record<string, string>
        )[nextSlug] ||
        'Workspace';
      this.description =
        this.config?.description ||
        (
          {
            reports: 'Analyse revenue, sales, taxes and outstanding balances.',
            branding: 'Control your business identity and document presentation.',
            settings: 'Configure your organisation, users, currencies and preferences.',
          } as Record<string, string>
        )[nextSlug] ||
        '';
      this.rows.set(this.loadRows());
      this.search.set('');
      this.status.set('All statuses');
      this.modal.set(false);
      this.detail.set(null);
    });
  }
  private loadRows() {
    if (!this.config) return [];
    try {
      return JSON.parse(localStorage.getItem(`titan-${this.slug}`) || 'null') || this.config.rows;
    } catch {
      return this.config.rows;
    }
  }
  private persist() {
    localStorage.setItem(`titan-${this.slug}`, JSON.stringify(this.rows()));
  }
  protected openNew() {
    const row: Row = {};
    for (const f of this.config.fields) row[f.key] = f.type === 'number' ? 0 : f.options?.[0] || '';
    this.editing.set(row);
    this.modal.set(true);
  }
  protected openEdit(row: Row) {
    this.editing.set({ ...row });
    this.modal.set(true);
  }
  protected updateField(key: string, value: string) {
    this.editing.update((r) => ({
      ...r,
      [key]:
        this.config.fields.find((f) => f.key === key)?.type === 'number' ? Number(value) : value,
    }));
  }
  protected productConfig(): BlindProductConfig {
    return (
      this.editing()['blindConfig'] || {
        ...structuredClone(DEFAULT_BLIND_CONFIG),
        madeToMeasure: !!this.editing()['customSpecs'],
      }
    );
  }
  protected setMadeToMeasure(enabled: boolean) {
    this.editing.update((row) => ({
      ...row,
      customSpecs: enabled,
      blindConfig: { ...this.productConfig(), madeToMeasure: enabled },
    }));
  }
  protected updateBlindConfig(key: keyof BlindProductConfig, value: unknown) {
    this.editing.update((row) => ({
      ...row,
      blindConfig: { ...this.productConfig(), [key]: value },
    }));
  }
  protected updateBlindDefault(key: string, value: string) {
    this.updateBlindConfig('defaults', { ...this.productConfig().defaults, [key]: value });
  }
  protected toggleBlindSpec(key: string) {
    const config = this.productConfig();
    const enabledSpecs = config.enabledSpecs.includes(key)
      ? config.enabledSpecs.filter((item) => item !== key)
      : [...config.enabledSpecs, key];
    this.updateBlindConfig('enabledSpecs', enabledSpecs);
  }
  protected save() {
    const row = { ...this.editing() };
    if (!String(row[this.config.fields[0].key] || '').trim()) {
      this.store.notify(`${this.config.fields[0].label} is required`);
      return;
    }
    if (!row['id'])
      row['id'] =
        `${this.slug.slice(0, 3).toUpperCase()}-${String(this.rows().length + 1).padStart(3, '0')}`;
    if (!row['status']) row['status'] = 'Active';
    this.rows.update((all) => [row, ...all.filter((r) => r['id'] !== row['id'])]);
    this.persist();
    this.modal.set(false);
    this.store.notify(`${this.config.singular} saved successfully`);
  }
  protected remove(row: Row) {
    if (confirm(`Delete ${row['name'] || row['id']}?`)) {
      this.rows.update((all) => all.filter((r) => r['id'] !== row['id']));
      this.persist();
      this.store.notify(`${this.config.singular} deleted`);
    }
  }
  protected exportData(name = this.title) {
    const csv = this.rows()
      .map((r) => Object.values(r).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name.toLowerCase().replaceAll(' ', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    this.store.notify('CSV export downloaded');
  }
  protected saveSettings() {
    this.savedSettings.set(true);
    localStorage.setItem('titan-settings-saved', 'true');
    this.store.notify('Settings saved successfully');
  }
  protected chooseTemplate(name: string) {
    this.branding.setTemplate(name as DocumentTemplate);
    this.store.notify(`${name} template selected`);
  }
  protected changeBrandColor(colour: string) {
    this.branding.setBrandColor(colour);
  }
  protected uploadLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.store.notify('Please choose a PNG, JPG or SVG image');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.store.notify('Logo must be smaller than 2 MB');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.branding.setLogo(String(reader.result || ''));
      this.store.notify('Company logo updated');
    };
    reader.readAsDataURL(file);
  }
  protected removeLogo() {
    this.branding.setLogo('');
    this.store.notify('Company logo removed');
  }
  protected String(v: unknown) {
    return String(v);
  }
}
