import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrototypeStore } from '../../data/prototype-store';
import { UiIcon } from '../../shared/ui-icon';

type Period = 'Current month' | 'Current quarter' | 'This year' | 'Custom dates';
type ExportFormat = 'XLSX' | 'CSV' | 'PDF' | 'Accounting package ZIP';
type PaymentState = 'Paid' | 'Unpaid' | 'Partially paid' | 'Overdue' | 'Refunded';
type DocumentState = 'Issued' | 'Void' | 'Credit note';
interface RegisterRow {
  id: string;
  issueDate: string;
  customer: string;
  description: string;
  currency: string;
  net: number;
  discount: number;
  vat: number;
  gross: number;
  paymentStatus: PaymentState;
  paymentDate: string;
  paid: number;
  outstanding: number;
  state: DocumentState;
  creditNote: string;
  adjustment: number;
  pdf: string;
  pdfAvailable: boolean;
  taxRate: string;
}

const REPORT_ROWS: RegisterRow[] = [
  {
    id: 'INV-2026-0126',
    issueDate: '2026-10-21',
    customer: 'Global Tech Ltd',
    description: 'Laptop Pro 16 and setup services',
    currency: 'GBP',
    net: 2415.83,
    discount: 0,
    vat: 483.17,
    gross: 2899,
    paymentStatus: 'Partially paid',
    paymentDate: '2026-10-28',
    paid: 1600,
    outstanding: 1299,
    state: 'Issued',
    creditNote: '—',
    adjustment: 0,
    pdf: 'INV-2026-0126.pdf',
    pdfAvailable: true,
    taxRate: '20%',
  },
  {
    id: 'INV-2026-0125',
    issueDate: '2026-10-18',
    customer: 'Horizon Solutions',
    description: 'Annual cloud support plan',
    currency: 'USD',
    net: 4366.67,
    discount: 0,
    vat: 873.33,
    gross: 5240,
    paymentStatus: 'Paid',
    paymentDate: '2026-10-24',
    paid: 5240,
    outstanding: 0,
    state: 'Issued',
    creditNote: '—',
    adjustment: 0,
    pdf: 'INV-2026-0125.pdf',
    pdfAvailable: true,
    taxRate: '20%',
  },
  {
    id: 'INV-2026-0124',
    issueDate: '2026-10-12',
    customer: 'Northstar Retail',
    description: 'Hardware supply and installation',
    currency: 'USD',
    net: 3000,
    discount: 0,
    vat: 180,
    gross: 3180,
    paymentStatus: 'Unpaid',
    paymentDate: '',
    paid: 0,
    outstanding: 3180,
    state: 'Issued',
    creditNote: '—',
    adjustment: 0,
    pdf: 'INV-2026-0124.pdf',
    pdfAvailable: true,
    taxRate: '6%',
  },
  {
    id: 'INV-2026-0123',
    issueDate: '2026-10-02',
    customer: 'Apex Industries',
    description: 'Consulting and implementation',
    currency: 'EUR',
    net: 7500,
    discount: 291.67,
    vat: 1441.67,
    gross: 8650,
    paymentStatus: 'Overdue',
    paymentDate: '',
    paid: 0,
    outstanding: 8650,
    state: 'Issued',
    creditNote: '—',
    adjustment: 0,
    pdf: 'INV-2026-0123.pdf',
    pdfAvailable: true,
    taxRate: '20%',
  },
  {
    id: 'INV-2026-0118',
    issueDate: '2026-09-22',
    customer: 'Acme Corporation',
    description: 'Motorised blind installation',
    currency: 'EUR',
    net: 3900,
    discount: 100,
    vat: 760,
    gross: 4560,
    paymentStatus: 'Paid',
    paymentDate: '2026-09-29',
    paid: 4560,
    outstanding: 0,
    state: 'Issued',
    creditNote: 'CN-2026-0008',
    adjustment: -240,
    pdf: 'INV-2026-0118.pdf',
    pdfAvailable: true,
    taxRate: '20%',
  },
  {
    id: 'CN-2026-0008',
    issueDate: '2026-10-03',
    customer: 'Acme Corporation',
    description: 'Installation service credit',
    currency: 'EUR',
    net: -200,
    discount: 0,
    vat: -40,
    gross: -240,
    paymentStatus: 'Refunded',
    paymentDate: '2026-10-05',
    paid: -240,
    outstanding: 0,
    state: 'Credit note',
    creditNote: 'INV-2026-0118',
    adjustment: -240,
    pdf: 'CN-2026-0008.pdf',
    pdfAvailable: true,
    taxRate: '20%',
  },
  {
    id: 'INV-2026-0107',
    issueDate: '2026-08-14',
    customer: 'Oldtown Retail',
    description: 'Window covering supply',
    currency: 'GBP',
    net: 2458.33,
    discount: 0,
    vat: 491.67,
    gross: 2950,
    paymentStatus: 'Unpaid',
    paymentDate: '',
    paid: 0,
    outstanding: 2950,
    state: 'Void',
    creditNote: '—',
    adjustment: 0,
    pdf: 'INV-2026-0107.pdf',
    pdfAvailable: true,
    taxRate: '20%',
  },
];

@Component({
  selector: 'app-invoice-register',
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe, UiIcon],
  templateUrl: './invoice-register.html',
  styleUrl: './invoice-register.css',
})
export class InvoiceRegisterPage {
  protected store = inject(PrototypeStore);
  protected period = signal<Period>('Current quarter');
  protected from = signal('2026-10-01');
  protected to = signal('2026-12-31');
  protected advanced = signal(false);
  protected exportOpen = signal(false);
  protected customer = signal('All customers');
  protected payment = signal('All payment states');
  protected currency = signal('All currencies');
  protected tax = signal('All tax rates');
  protected state = signal('All document states');
  protected includeVoid = signal(true);
  protected generated = signal('');
  protected previewed = signal(false);
  protected exporting = signal(false);
  protected error = signal('');
  protected customers = ['All customers', ...new Set(REPORT_ROWS.map((r) => r.customer))];
  protected currencies = ['All currencies', ...new Set(REPORT_ROWS.map((r) => r.currency))];
  protected range = computed(() => this.resolveRange());
  protected rows = computed(() => {
    const [start, end] = this.range();
    return REPORT_ROWS.filter(
      (r) =>
        r.issueDate >= start &&
        r.issueDate <= end &&
        (this.customer() === 'All customers' || r.customer === this.customer()) &&
        (this.payment() === 'All payment states' || r.paymentStatus === this.payment()) &&
        (this.currency() === 'All currencies' || r.currency === this.currency()) &&
        (this.tax() === 'All tax rates' || r.taxRate === this.tax()) &&
        (this.state() === 'All document states' || r.state === this.state()) &&
        (this.includeVoid() || r.state !== 'Void'),
    );
  });
  protected totals = computed(() => {
    const map = new Map<
      string,
      { net: number; vat: number; gross: number; paid: number; outstanding: number }
    >();
    for (const r of this.rows()) {
      const t = map.get(r.currency) || { net: 0, vat: 0, gross: 0, paid: 0, outstanding: 0 };
      t.net += r.net - r.discount;
      t.vat += r.vat;
      t.gross += r.gross;
      t.paid += r.paid;
      t.outstanding += r.outstanding;
      map.set(r.currency, t);
    }
    return [...map.entries()].map(([currency, values]) => ({ currency, ...values }));
  });
  protected missingPdfs = computed(() => this.rows().filter((r) => !r.pdfAvailable));
  protected changePeriod(value: Period) {
    this.period.set(value);
    this.error.set('');
    if (value === 'Current month') {
      this.from.set('2026-11-01');
      this.to.set('2026-11-30');
    }
    if (value === 'Current quarter') {
      this.from.set('2026-10-01');
      this.to.set('2026-12-31');
    }
    if (value === 'This year') {
      this.from.set('2026-01-01');
      this.to.set('2026-12-31');
    }
  }
  protected preview() {
    if (!this.validRange()) return;
    this.previewed.set(true);
    this.generated.set('');
    this.store.notify(`Preview ready · ${this.rows().length} records`);
  }
  protected clearFilters() {
    this.customer.set('All customers');
    this.payment.set('All payment states');
    this.currency.set('All currencies');
    this.tax.set('All tax rates');
    this.state.set('All document states');
    this.includeVoid.set(true);
  }
  protected export(format: ExportFormat) {
    if (!this.validRange() || this.exporting()) return;
    this.exportOpen.set(false);
    this.exporting.set(true);
    window.setTimeout(() => {
      if (format === 'PDF') {
        window.print();
      } else if (format === 'CSV') {
        this.download(this.csv(), 'text/csv;charset=utf-8', this.filename('csv'));
      } else if (format === 'XLSX') {
        this.download(
          this.tsv(),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          this.filename('xlsx'),
        );
      } else {
        this.download(this.packageManifest(), 'application/zip', this.filename('zip'));
      }
      this.exporting.set(false);
      this.generated.set(
        `${format} generated · ${this.rows().length} records · all document PDFs included`,
      );
      this.audit(format);
    }, 650);
  }
  private validRange() {
    if (this.from() > this.to()) {
      this.error.set('The start date must be on or before the end date.');
      return false;
    }
    this.error.set('');
    return true;
  }
  private resolveRange(): [string, string] {
    return [this.from(), this.to()];
  }
  private headers() {
    return [
      'Invoice number',
      'Issue date',
      'Customer',
      'Description',
      'Currency',
      'Net',
      'Discount',
      'VAT',
      'Gross',
      'Payment status',
      'Payment date',
      'Amount paid',
      'Outstanding',
      'Document state',
      'Credit note / adjustment',
      'Adjustment value',
      'Invoice PDF reference',
    ];
  }
  private values(r: RegisterRow) {
    return [
      r.id,
      r.issueDate,
      r.customer,
      r.description,
      r.currency,
      r.net,
      r.discount,
      r.vat,
      r.gross,
      r.paymentStatus,
      r.paymentDate,
      r.paid,
      r.outstanding,
      r.state,
      r.creditNote,
      r.adjustment,
      r.pdfAvailable ? r.pdf : `MISSING: ${r.pdf}`,
    ];
  }
  private csv() {
    const esc = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`;
    return (
      '\ufeff' +
      [this.headers(), ...this.rows().map((r) => this.values(r))]
        .map((row) => row.map(esc).join(','))
        .join('\r\n')
    );
  }
  private tsv() {
    return [
      this.headers(),
      ...this.rows().map((r) => this.values(r)),
      [],
      ['SUMMARY BY CURRENCY'],
      ...this.totals().map((t) => [t.currency, t.net, t.vat, t.gross, t.paid, t.outstanding]),
    ]
      .map((row) => row.join('\t'))
      .join('\r\n');
  }
  private packageManifest() {
    return `TITAN ENGAGE ACCOUNTING PACKAGE\nCompany: Acme Trading Ltd\nPeriod: ${this.from()} to ${this.to()} (inclusive, Asia/Calcutta)\nGenerated: ${new Date().toISOString()}\nRecords: ${this.rows().length}\n\nFILES\ninvoice-register.xlsx\n${this.rows()
      .filter((r) => r.pdfAvailable)
      .map((r) => `invoices/${r.pdf}`)
      .join('\n')}\n\nMISSING / UNAVAILABLE PDFS\n${
      this.missingPdfs()
        .map((r) => `${r.id}: ${r.pdf}`)
        .join('\n') || 'None'
    }\n`;
  }
  private filename(ext: string) {
    return `acme-trading-invoice-register-${this.from()}-to-${this.to()}.${ext}`;
  }
  private download(content: string, type: string, name: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
  private audit(format: string) {
    const entry = {
      company: 'Acme Trading Ltd',
      user: 'John Smith',
      format,
      from: this.from(),
      to: this.to(),
      filters: {
        customer: this.customer(),
        payment: this.payment(),
        currency: this.currency(),
        tax: this.tax(),
        state: this.state(),
      },
      records: this.rows().length,
      generatedAt: new Date().toISOString(),
    };
    const key = 'titan-report-audit';
    const previous = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([entry, ...previous].slice(0, 20)));
  }
}
