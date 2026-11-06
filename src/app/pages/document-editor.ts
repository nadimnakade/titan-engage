import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentKind, PrototypeStore } from '../data/prototype-store';
import { UiIcon } from '../shared/ui-icon';
import { QuotationStore } from '../data/quotation-store';
import { BrandingStore } from '../data/branding-store';

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
  protected products = [
    ['Cloud Support Plan', 'Annual priority support', 850, 20],
    ['Security Audit', 'Infrastructure security review', 1200, 20],
    ['Team Training', 'On-site team workshop', 650, 0],
  ];
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
  private makeItem(name: string, description: string, qty: number, price: number, tax: number) {
    return this.fb.nonNullable.group({
      name: [name, Validators.required],
      description: [description],
      qty: [qty, [Validators.required, Validators.min(0.01)]],
      unit: ['Each'],
      price: [price, [Validators.required, Validators.min(0)]],
      discount: [0],
      tax: [tax],
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
    const quote =
      this.kind === 'quotation' && this.documentId ? this.quotes.get(this.documentId) : undefined;
    if (quote) {
      this.form.patchValue({
        customer: quote.customer,
        currency: quote.currency,
        reference: `Source ${quote.id}`,
      });
      this.items.clear();
      quote.items.forEach((item) =>
        this.items.push(this.makeItem(item.name, item.description, item.qty, item.price, item.tax)),
      );
    }
    this.form.valueChanges.subscribe(() => this.revision.update((v) => v + 1));
  }
  protected addItem(p?: any[]) {
    this.items.push(
      this.makeItem(p?.[0] || 'New item', p?.[1] || 'Add a description', 1, p?.[2] || 0, 0),
    );
    this.productMenu.set(false);
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
    if (this.form.invalid) {
      this.store.notify('Please complete the required fields');
      return;
    }
    this.store.save({
      id: this.form.controls.number.value,
      kind: this.kind,
      customer: this.form.controls.customer.value,
      date: '31 Oct 2026',
      due: '30 Nov 2026',
      total: this.total() / 100,
      paid: 0,
      status: 'Draft',
    });
    this.saved.set(true);
  }
  protected send() {
    this.save();
    if (this.form.valid)
      this.store.notify(`${this.title} preview sent to ${this.form.controls.customer.value}`);
  }
  protected download() {
    this.store.notify('Print dialog opened for PDF preview');
    window.print();
  }
  protected back() {
    this.router.navigate([this.kind === 'invoice' ? '/invoices' : '/quotations']);
  }
}
