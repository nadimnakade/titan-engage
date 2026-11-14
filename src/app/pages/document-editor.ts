import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentKind, PrototypeStore } from '../data/prototype-store';
import { UiIcon } from '../shared/ui-icon';
import { QuotationStore } from '../data/quotation-store';
import { BrandingStore } from '../data/branding-store';
import {
  CatalogueProduct,
  DEFAULT_CATALOGUE,
  DEFAULT_BLIND_CONFIG,
  BlindProductConfig,
  customerDescription,
} from '../data/blind-config';

@Component({
  selector: 'app-document-editor',
  imports: [ReactiveFormsModule, CurrencyPipe, UiIcon],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css',
})
export class DocumentEditorPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected store = inject(PrototypeStore);
  protected branding = inject(BrandingStore);
  private quotes = inject(QuotationStore);
  protected kind = this.route.snapshot.data['type'] as DocumentKind;
  protected title = this.kind === 'invoice' ? 'Invoice' : 'Quotation';
  protected documentId = this.route.snapshot.paramMap.get('id');
  protected isExisting = !!this.documentId;
  protected previewTab = signal(false);
  protected productMenu = signal(false);
  protected saved = signal(false);
  protected newCustomerOpen = signal(false);
  protected addCustomerContact = signal(true);
  protected newCustomer = signal({ name: '', email: '', address: '' });
  protected form = this.fb.nonNullable.group({
    number: [this.kind === 'invoice' ? 'INV-2026-0127' : 'Q-2026-0049', [Validators.required]],
    date: ['2026-10-31'],
    due: ['2026-11-30'],
    customer: ['Global Tech Ltd', Validators.required],
    currency: ['USD'],
    reference: ['PO-4582'],
    discount: [0],
    taxEnabled: [false],
    taxRate: [20],
    notes: ['Thank you for your business. We look forward to working with you.'],
    terms: ['Payment due within 30 days.'],
    items: this.fb.array([
      this.makeItem('Laptop Pro 16”', 'High performance business laptop', 2, 1200, 20),
      this.makeItem('Wireless Mouse', 'Ergonomic wireless mouse', 5, 25, 20),
      this.makeItem('Setup Service', 'Installation and configuration', 1, 150, 0),
    ]),
  });
  protected customers = [
    'Global Tech Ltd',
    'Horizon Solutions',
    'Northstar Retail',
    'Apex Industries',
  ];
  protected products = this.loadCatalogue();
  get items() {
    return this.form.controls.items as FormArray;
  }
  private revision = signal(0);
  protected subtotal = computed(() => {
    this.revision();
    return this.items.controls.reduce(
      (s, c) => s + Math.round((Number(c.value.qty) || 0) * (Number(c.value.price) || 0) * 100),
      0,
    );
  });
  protected lineDiscount = computed(() => {
    this.revision();
    return this.items.controls.reduce(
      (s, c) =>
        s +
        Math.round(
          (Number(c.value.qty) || 0) *
            (Number(c.value.price) || 0) *
            (Number(c.value.discount) || 0),
        ),
      0,
    );
  });
  protected documentDiscount = computed(() => {
    this.revision();
    return Math.round(
      ((this.subtotal() - this.lineDiscount()) * this.form.controls.discount.value) / 100,
    );
  });
  protected taxable = computed(
    () => this.subtotal() - this.lineDiscount() - this.documentDiscount(),
  );
  protected tax = computed(() => {
    this.revision();
    return this.form.controls.taxEnabled.value
      ? Math.round((this.taxable() * this.form.controls.taxRate.value) / 100)
      : 0;
  });
  protected total = computed(() => this.taxable() + this.tax());
  private makeItem(
    name: string,
    description: string,
    qty: number,
    price: number,
    tax: number,
    product?: CatalogueProduct,
    savedSpecs: Record<string, unknown> = {},
  ) {
    const config = product?.config;
    const defaults = config?.defaults || {};
    return this.fb.nonNullable.group({
      productId: [product?.id || ''],
      name: [name, Validators.required],
      description: [description],
      qty: [qty, [Validators.required, Validators.min(0.01)]],
      unit: ['Each'],
      price: [price, [Validators.required, Validators.min(0)]],
      discount: [0],
      tax: [tax],
      madeToMeasure: [!!config?.madeToMeasure],
      family: [config?.family || ''],
      specConfig: [config ? structuredClone(config) : null as BlindProductConfig | null],
      specifications: this.fb.nonNullable.group({
        room: [String(savedSpecs['room'] || '')],
        width: [Number(savedSpecs['width'] || 0)],
        drop: [Number(savedSpecs['drop'] || savedSpecs['height'] || 0)],
        unit: [String(savedSpecs['unit'] || defaults['unit'] || 'cm')],
        measurementBasis: [String(savedSpecs['measurementBasis'] || defaults['measurementBasis'] || '')],
        fittingPosition: [String(savedSpecs['fittingPosition'] || defaults['fittingPosition'] || '')],
        mountingSurface: [String(savedSpecs['mountingSurface'] || defaults['mountingSurface'] || '')],
        fabric: [String(savedSpecs['fabric'] || savedSpecs['Colour'] || '')],
        operation: [String(savedSpecs['operation'] || defaults['operation'] || 'Manual')],
        manualMechanism: [String(savedSpecs['manualMechanism'] || defaults['manualMechanism'] || 'Chain')],
        controlPosition: [String(savedSpecs['controlPosition'] || defaults['controlPosition'] || 'Right')],
        openingDirection: [String(savedSpecs['openingDirection'] || '')],
        stackingPosition: [String(savedSpecs['stackingPosition'] || '')],
        chainLength: [String(savedSpecs['chainLength'] || defaults['chainLength'] || 'Standard')],
        customChainLength: [Number(savedSpecs['customChainLength'] || 0)],
        rollDirection: [String(savedSpecs['rollDirection'] || defaults['rollDirection'] || 'Standard')],
        slatWidth: [String(savedSpecs['slatWidth'] || '')],
        motorType: [String(savedSpecs['motorType'] || '')],
        motorPower: [String(savedSpecs['motorPower'] || '')],
        motorControl: [String(savedSpecs['motorControl'] || '')],
        motorPosition: [String(savedSpecs['motorPosition'] || '')],
        extras: [String(savedSpecs['extras'] || 'None')],
        instructions: [String(savedSpecs['instructions'] || '')],
      }),
    });
  }
  constructor() {
    const existing = this.documentId
      ? this.store.documents().find((d) => d.id === this.documentId)
      : undefined;
    if (this.documentId) this.form.controls.number.setValue(this.documentId);
    if (existing)
      this.form.patchValue({
        customer: existing.customer,
        reference: `Source ${existing.id}`,
      });
    if (existing?.items?.length) {
      this.items.clear();
      existing.items.forEach((item) => {
        const product = this.products.find((p) => p.id === item.productId);
        this.items.push(
          this.makeItem(
            item.name,
            item.description,
            item.qty,
            item.price,
            item.tax,
            product || (item.madeToMeasure ? { id: String(item.id), name: item.name, description: item.description, price: item.price, tax: item.tax, config: { ...structuredClone(DEFAULT_BLIND_CONFIG), family: (item.family || 'Other') as any } } : undefined),
            item.specifications,
          ),
        );
      });
    }
    const quote =
      this.kind === 'quotation' && this.documentId ? this.quotes.get(this.documentId) : undefined;
    if (quote) {
      this.form.patchValue({
        customer: quote.customer,
        currency: quote.currency,
        reference: `Source ${quote.id}`,
      });
      this.items.clear();
      quote.items.forEach((item) => {
        const product = this.products.find((p) => p.name === item.name);
        const specs = this.normaliseQuoteAttributes(item.attributes);
        this.items.push(this.makeItem(item.name, item.description, item.qty, item.price, item.tax, product, specs));
      });
    }
    this.form.valueChanges.subscribe(() => this.revision.update((v) => v + 1));
  }
  protected addItem(product?: CatalogueProduct) {
    this.items.push(
      this.makeItem(
        product?.name || 'New item',
        product?.description || 'Add a description',
        1,
        product?.price || 0,
        product?.tax || 0,
        product,
      ),
    );
    this.productMenu.set(false);
  }
  protected duplicateItem(i: number) {
    const value = structuredClone(this.items.at(i).getRawValue());
    const product = this.products.find((p) => p.id === value.productId);
    const copy = this.makeItem(value.name, value.description, value.qty, value.price, value.tax, product, value.specifications);
    copy.controls.discount.setValue(value.discount);
    this.items.insert(i + 1, copy);
    this.store.notify('Configured blind duplicated — update the room or dimensions');
  }
  protected specEnabled(i: number, key: string) {
    const config = this.items.at(i).get('specConfig')?.value as BlindProductConfig | null;
    return !!config?.enabledSpecs.includes(key);
  }
  protected specOptions(i: number, key: string): string[] {
    const config = this.items.at(i).get('specConfig')?.value as BlindProductConfig | null;
    return config?.options[key] || [];
  }
  protected isManual(i: number) {
    return this.items.at(i).get('specifications.operation')?.value === 'Manual';
  }
  protected isMotorised(i: number) {
    return this.items.at(i).get('specifications.operation')?.value === 'Motorised';
  }
  protected removeItem(i: number) {
    if (this.items.length > 1) this.items.removeAt(i);
  }
  protected move(i: number, delta: number) {
    const target = i + delta;
    if (target < 0 || target >= this.items.length) return;
    const item = this.items.at(i);
    this.items.removeAt(i);
    this.items.insert(target, item);
  }
  protected save() {
    this.form.markAllAsTouched();
    const blindError = this.validateBlindItems();
    if (blindError) {
      this.store.notify(blindError);
      return;
    }
    if (this.form.invalid) {
      this.store.notify('Please complete the required fields');
      return;
    }
    const lineItems = this.serialiseItems();
    this.store.save({
      id: this.form.controls.number.value,
      kind: this.kind,
      customer: this.form.controls.customer.value,
      date: '31 Oct 2026',
      due: '30 Nov 2026',
      total: this.total() / 100,
      paid: 0,
      status: 'Draft',
      items: lineItems,
    });
    if (this.kind === 'quotation') {
      const current = this.documentId ? this.quotes.get(this.documentId) : undefined;
      this.quotes.upsert({
        id: this.form.controls.number.value,
        customer: this.form.controls.customer.value,
        email: current?.email || 'customer@example.demo',
        created: current?.created || '31 Oct 2026',
        validUntil: current?.validUntil || '30 Nov 2026',
        currency: this.form.controls.currency.value,
        status: current?.status || 'Active',
        visibility: current?.visibility || 'Normal',
        emailState: current?.emailState || 'Not sent',
        total: this.total() / 100,
        items: lineItems.map((item) => ({
          id: String(item.id), name: item.name, description: item.description, qty: item.qty,
          price: item.price, discount: item.discount, tax: item.tax,
          template: item.family || 'Standard product', attributes: item.specifications || {},
        })),
        notes: this.form.controls.notes.value,
        invoice: current?.invoice,
        audit: current?.audit || [],
      });
    }
    this.saved.set(true);
  }
  protected send() {
    this.save();
    if (this.form.valid) {
      const id = this.form.controls.number.value;
      const saved = this.store.documents().find((d) => d.id === id);
      if (saved) this.store.save({ ...saved, status: 'Sent to customer' });
      this.store.notify(`${this.title} preview sent to ${this.form.controls.customer.value}`);
    }
  }
  protected download() {
    this.store.notify('Print dialog opened for PDF preview');
    window.print();
  }
  protected back() {
    this.router.navigate([this.kind === 'invoice' ? '/invoices' : '/quotations']);
  }
  private loadCatalogue(): CatalogueProduct[] {
    let stored: any[] = [];
    try {
      stored = JSON.parse(localStorage.getItem('titan-products') || '[]');
    } catch {
      stored = [];
    }
    const mapped: CatalogueProduct[] = stored.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      description: `${row.category || 'Product'} · ${row.sku || ''}`,
      price: Number(row.price) || 0,
      tax: Number(String(row.tax || '').match(/[\d.]+/)?.[0] || 0),
      config: row.customSpecs
        ? (row.blindConfig || structuredClone(DEFAULT_BLIND_CONFIG))
        : undefined,
    }));
    const merged: CatalogueProduct[] = [...mapped];
    for (const product of DEFAULT_CATALOGUE) {
      if (!merged.some((item) => item.id === product.id || item.name === product.name))
        merged.push(structuredClone(product));
    }
    return merged;
  }
  private normaliseQuoteAttributes(attributes: Record<string, unknown>) {
    return {
      ...attributes,
      width: Number(String(attributes['Width'] || '').match(/[\d.]+/)?.[0] || 0),
      drop: Number(String(attributes['Height'] || '').match(/[\d.]+/)?.[0] || 0),
      unit: String(attributes['Width'] || '').includes('mm') ? 'mm' : 'cm',
      operation: attributes['Mechanism'] || attributes['operation'] || 'Manual',
      controlPosition: attributes['Operating string location'] || attributes['controlPosition'] || 'Right',
      openingDirection: attributes['Opening direction'] || attributes['openingDirection'] || '',
      fabric: attributes['Colour'] || attributes['fabric'] || '',
    };
  }
  private validateBlindItems(): string {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items.at(i);
      if (!item.get('madeToMeasure')?.value) continue;
      const specs = item.get('specifications')?.value as Record<string, any>;
      const config = item.get('specConfig')?.value as BlindProductConfig;
      const width = Number(specs['width']);
      const drop = Number(specs['drop']);
      if (!(width > 0) || !(drop > 0)) return `Item ${i + 1}: width and drop must be positive values`;
      if (config?.minWidth && width < config.minWidth) return `Item ${i + 1}: width must be at least ${config.minWidth} ${specs['unit']}`;
      if (config?.maxWidth && width > config.maxWidth) return `Item ${i + 1}: width cannot exceed ${config.maxWidth} ${specs['unit']}`;
      if (config?.minDrop && drop < config.minDrop) return `Item ${i + 1}: drop must be at least ${config.minDrop} ${specs['unit']}`;
      if (config?.maxDrop && drop > config.maxDrop) return `Item ${i + 1}: drop cannot exceed ${config.maxDrop} ${specs['unit']}`;
      if (specs['chainLength'] === 'Custom length' && !(Number(specs['customChainLength']) > 0))
        return `Item ${i + 1}: enter a positive custom chain or cord length`;
    }
    return '';
  }
  private serialiseItems() {
    return this.items.controls.map((control, index) => {
      const value = control.getRawValue();
      const specs = value.madeToMeasure ? structuredClone(value.specifications) : undefined;
      const description = specs ? customerDescription(value.name, specs) : value.description;
      control.get('description')?.setValue(description, { emitEvent: false });
      return {
        id: `${this.form.controls.number.value}-ITEM-${index + 1}`,
        productId: value.productId,
        name: value.name,
        description,
        qty: Number(value.qty),
        unit: value.unit,
        price: Number(value.price),
        discount: Number(value.discount),
        tax: Number(value.tax),
        madeToMeasure: !!value.madeToMeasure,
        family: value.family,
        specifications: specs,
      };
    });
  }
  protected updateNewCustomer(key: 'name' | 'email' | 'address', value: string) {
    this.newCustomer.update((v) => ({ ...v, [key]: value }));
  }
  protected useNewCustomer() {
    const customer = this.newCustomer();
    if (!customer.name.trim() || !customer.email.trim()) {
      this.store.notify('Customer name and email are required');
      return;
    }
    if (this.addCustomerContact() && !this.customers.includes(customer.name))
      this.customers.push(customer.name);
    this.form.controls.customer.setValue(customer.name);
    this.newCustomerOpen.set(false);
    this.store.notify(
      this.addCustomerContact()
        ? 'New customer added to contacts'
        : 'Customer details applied to this document',
    );
  }
}
