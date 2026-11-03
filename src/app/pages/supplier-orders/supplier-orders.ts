import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PrototypeStore } from '../../data/prototype-store';
import { QuotationStore } from '../../data/quotation-store';
import { UiIcon } from '../../shared/ui-icon';

type RequirementStatus = 'Pending' | 'Draft' | 'Sent';
interface Requirement {
  id: string;
  supplier: string;
  item: string;
  specs: string;
  required: number;
  queued: number;
  source: string;
  customer: string;
  added: string;
  status: RequirementStatus;
  sourceItemId?: string;
}

interface SourceItem {
  id: string;
  name: string;
  description: string;
  qty: number;
  supplier: string;
  procureable: boolean;
}

const seed: Requirement[] = [
  {
    id: 'PR-1008',
    supplier: 'Northern Textiles',
    item: 'Roller blind',
    specs: '120 × 150 cm · Black · Motorised',
    required: 2,
    queued: 0,
    source: 'Q-2026-0052',
    customer: 'Acme Corporation',
    added: '31 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'PR-1007',
    supplier: 'Northern Textiles',
    item: 'Venetian blind',
    specs: '90 × 120 cm · Grey · Manual',
    required: 3,
    queued: 1,
    source: 'Q-2026-0054',
    customer: 'Smith Residence',
    added: '30 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'PR-1006',
    supplier: 'Motion Components',
    item: 'Blind motor 230V',
    specs: 'Model M2 · 230V · White',
    required: 4,
    queued: 0,
    source: 'INV-2026-0056',
    customer: 'Malta Retail Group',
    added: '29 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'PR-1005',
    supplier: 'Unassigned',
    item: 'Mounting bracket set',
    specs: 'Heavy duty · Stainless steel',
    required: 8,
    queued: 0,
    source: 'Q-2026-0051',
    customer: 'Global Services Ltd',
    added: '28 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'PR-1004',
    supplier: 'Northern Textiles',
    item: 'Roman blind fabric',
    specs: 'Sand · Blackout · 18 m²',
    required: 18,
    queued: 6,
    source: 'INV-2026-0053',
    customer: 'Island Ventures',
    added: '27 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'PR-1003',
    supplier: 'Motion Components',
    item: 'Remote controller',
    specs: 'RC-4 · Four channel',
    required: 5,
    queued: 0,
    source: 'Q-2026-0049',
    customer: 'Premier Supplies',
    added: '26 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'PR-1002',
    supplier: 'Northern Textiles',
    item: 'Vertical blind slats',
    specs: '127 mm · Pearl white · 24 pcs',
    required: 24,
    queued: 24,
    source: 'Q-2026-0048',
    customer: 'John Doe',
    added: '24 Oct 2026',
    status: 'Draft',
  },
  {
    id: 'PR-1001',
    supplier: 'Motion Components',
    item: 'Tubular motor',
    specs: 'TM45 · 40 Nm · 230V',
    required: 2,
    queued: 2,
    source: 'INV-2026-0047',
    customer: 'Apex Industries',
    added: '22 Oct 2026',
    status: 'Sent',
  },
];

@Component({
  selector: 'app-supplier-orders',
  imports: [FormsModule, RouterLink, UiIcon],
  templateUrl: './supplier-orders.html',
  styleUrl: './supplier-orders.css',
})
export class SupplierOrdersPage {
  private toast = inject(PrototypeStore);
  private quotes = inject(QuotationStore);
  private route = inject(ActivatedRoute);
  private storageKey = 'titan-supplier-requirements-v1';
  protected source = this.route.snapshot.queryParamMap.get('source');
  protected requirements = signal<Requirement[]>(this.loadRequirements());
  protected view = signal<RequirementStatus | 'All'>('Pending');
  protected query = signal('');
  protected supplier = signal('All suppliers');
  protected selected = signal(new Set<string>());
  protected reviewOpen = signal(false);
  protected filtersOpen = signal(false);
  protected importOpen = signal(!!this.source);
  protected importSelected = signal(new Set<string>());
  protected importSuppliers = signal<Record<string, string>>({});
  protected importQuantities = signal<Record<string, number>>({});
  protected views: (RequirementStatus | 'All')[] = ['Pending', 'Draft', 'Sent', 'All'];
  protected suppliers = [
    'All suppliers',
    'Northern Textiles',
    'Motion Components',
    'Apex Distribution',
    'Unassigned',
  ];
  protected sourceItems = computed<SourceItem[]>(() => {
    if (!this.source) return [];
    if (this.source.startsWith('Q-')) {
      const quote = this.quotes.get(this.source);
      return (quote?.items ?? []).map((item, index) => ({
        id: item.id,
        name: item.name,
        description: [
          item.description,
          ...Object.entries(item.attributes)
            .slice(0, 4)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`),
        ].join(' · '),
        qty: item.qty,
        supplier: index % 2 ? 'Motion Components' : 'Northern Textiles',
        procureable: !/service|labour|install/i.test(item.name),
      }));
    }
    return [
      {
        id: `${this.source}-laptop`,
        name: 'Laptop Pro 16″',
        description: 'Business laptop · 16 GB · 512 GB SSD',
        qty: 2,
        supplier: 'Apex Distribution',
        procureable: true,
      },
      {
        id: `${this.source}-mouse`,
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse · Graphite',
        qty: 5,
        supplier: 'Apex Distribution',
        procureable: true,
      },
      {
        id: `${this.source}-setup`,
        name: 'Setup Service',
        description: 'Installation and configuration labour',
        qty: 1,
        supplier: 'Unassigned',
        procureable: false,
      },
    ];
  });
  protected sourceCustomer = computed(() => {
    if (!this.source) return '';
    return (
      this.quotes.get(this.source)?.customer ??
      this.toast.documents().find((d) => d.id === this.source)?.customer ??
      'Customer account'
    );
  });
  protected filtered = computed(() =>
    this.requirements().filter(
      (r) =>
        (this.view() === 'All' || r.status === this.view()) &&
        (this.supplier() === 'All suppliers' || r.supplier === this.supplier()) &&
        `${r.item} ${r.specs} ${r.source} ${r.customer} ${r.supplier}`
          .toLowerCase()
          .includes(this.query().toLowerCase()),
    ),
  );
  protected selectedRows = computed(() =>
    this.requirements().filter((r) => this.selected().has(r.id)),
  );
  protected selectedSupplier = computed(() => [
    ...new Set(this.selectedRows().map((r) => r.supplier)),
  ]);
  protected count(v: RequirementStatus | 'All') {
    return this.requirements().filter((r) => v === 'All' || r.status === v).length;
  }
  protected alreadyImported(item: SourceItem) {
    return this.requirements()
      .filter((r) => r.source === this.source && r.sourceItemId === item.id)
      .reduce((sum, r) => sum + r.required, 0);
  }
  protected available(item: SourceItem) {
    return Math.max(0, item.qty - this.alreadyImported(item));
  }
  protected toggleImport(item: SourceItem) {
    if (!item.procureable || !this.available(item)) return;
    this.importSelected.update((current) => {
      const next = new Set(current);
      next.has(item.id) ? next.delete(item.id) : next.add(item.id);
      return next;
    });
    if (!this.importSuppliers()[item.id]) this.setImportSupplier(item.id, item.supplier);
    if (!this.importQuantities()[item.id]) this.setImportQuantity(item.id, this.available(item));
  }
  protected setImportSupplier(id: string, supplier: string) {
    this.importSuppliers.update((all) => ({ ...all, [id]: supplier }));
  }
  protected setImportQuantity(id: string, qty: number) {
    this.importQuantities.update((all) => ({ ...all, [id]: Math.max(1, Number(qty) || 1) }));
  }
  protected importItems() {
    const chosen = this.sourceItems().filter(
      (item) => this.importSelected().has(item.id) && this.available(item),
    );
    if (!chosen.length) {
      this.toast.notify('Select at least one available item');
      return;
    }
    const nextNumber = Math.max(
      1008,
      ...this.requirements().map((r) => Number(r.id.replace('PR-', '')) || 0),
    );
    const additions = chosen.map((item, index): Requirement => ({
      id: `PR-${nextNumber + index + 1}`,
      supplier: this.importSuppliers()[item.id] || item.supplier || 'Unassigned',
      item: item.name,
      specs: item.description,
      required: Math.min(
        this.available(item),
        this.importQuantities()[item.id] || this.available(item),
      ),
      queued: 0,
      source: this.source!,
      sourceItemId: item.id,
      customer: this.sourceCustomer(),
      added: '3 Nov 2026',
      status: 'Pending',
    }));
    this.requirements.update((all) => [...additions, ...all]);
    this.persist();
    this.importSelected.set(new Set());
    this.importOpen.set(false);
    this.view.set('Pending');
    this.toast.notify(
      `${additions.length} source item${additions.length === 1 ? '' : 's'} added to Supplier Orders`,
    );
  }
  protected assignSupplier(id: string, supplier: string) {
    this.requirements.update((all) => all.map((r) => (r.id === id ? { ...r, supplier } : r)));
    this.persist();
  }
  protected chooseView(v: RequirementStatus | 'All') {
    this.view.set(v);
    this.selected.set(new Set());
  }
  protected clearSelection() {
    this.selected.set(new Set());
  }
  protected toggle(id: string) {
    this.selected.update((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  protected toggleAll() {
    const ids = this.filtered().map((r) => r.id);
    this.selected.set(this.selected().size === ids.length ? new Set() : new Set(ids));
  }
  protected openReview() {
    if (!this.selected().size) {
      this.toast.notify('Select at least one requirement');
      return;
    }
    if (this.selectedSupplier().length > 1) {
      this.toast.notify('Select items from one supplier for each purchase order');
      return;
    }
    if (this.selectedSupplier()[0] === 'Unassigned') {
      this.toast.notify('Assign a supplier before creating a purchase order');
      return;
    }
    this.reviewOpen.set(true);
  }
  protected createDraft() {
    const ids = this.selected();
    this.requirements.update((all) =>
      all.map((r) =>
        ids.has(r.id) ? { ...r, status: 'Draft' as RequirementStatus, queued: r.required } : r,
      ),
    );
    this.reviewOpen.set(false);
    this.selected.set(new Set());
    this.view.set('Draft');
    this.persist();
    this.toast.notify('Draft purchase order PO-2026-0019 created');
  }
  protected reset() {
    this.query.set('');
    this.supplier.set('All suppliers');
    this.view.set('Pending');
    this.selected.set(new Set());
  }
  private loadRequirements(): Requirement[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || 'null') || seed;
    } catch {
      return seed;
    }
  }
  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.requirements()));
  }
}
