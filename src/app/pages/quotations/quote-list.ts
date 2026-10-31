import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuotationStore, QuoteRecord } from '../../data/quotation-store';
import { PrototypeStore } from '../../data/prototype-store';
@Component({
  selector: 'app-quote-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './quote-list.html',
  styleUrl: './quote-list.css',
})
export class QuoteListPage {
  protected qs = inject(QuotationStore);
  protected toast = inject(PrototypeStore);
  private router = inject(Router);
  protected view = signal('All Quotes');
  protected query = signal('');
  protected status = signal('All');
  protected converted = signal('All');
  protected email = signal('All');
  protected filtersOpen = signal(false);
  protected selected = signal<Set<string>>(new Set());
  protected menu = signal<string | null>(null);
  protected chooseView(v: string) {
    this.view.set(v);
    this.selected.set(new Set());
  }
  protected viewCount(v: string) {
    return this.qs
      .quotes()
      .filter((q) =>
        v === 'Archived'
          ? q.visibility === 'Archived'
          : v === 'Trash'
            ? q.visibility === 'Trash'
            : q.visibility === 'Normal' && (v === 'All Quotes' || q.status === v),
      ).length;
  }
  protected views = ['All Quotes', 'Active', 'Closed', 'Rejected', 'Archived', 'Trash'];
  protected visible = computed(() =>
    this.qs.quotes().filter((q) => {
      const v = this.view();
      const viewOk =
        v === 'Archived'
          ? q.visibility === 'Archived'
          : v === 'Trash'
            ? q.visibility === 'Trash'
            : q.visibility === 'Normal' && (v === 'All Quotes' || q.status === v);
      const text =
        `${q.id} ${q.customer} ${q.items.map((i) => i.description + ' ' + i.name).join(' ')}`.toLowerCase();
      return (
        viewOk &&
        text.includes(this.query().toLowerCase()) &&
        (this.status() === 'All' || q.status === this.status()) &&
        (this.converted() === 'All' ||
          (this.converted() === 'Converted' ? !!q.invoice : !q.invoice)) &&
        (this.email() === 'All' || q.emailState === this.email())
      );
    }),
  );
  protected toggle(id: string) {
    this.selected.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  protected toggleAll() {
    const ids = this.visible().map((q) => q.id);
    this.selected.set(this.selected().size === ids.length ? new Set() : new Set(ids));
  }
  protected act(q: QuoteRecord, action: string) {
    this.menu.set(null);
    if (action === 'View') this.router.navigate(['/quotations', q.id]);
    if (action === 'Edit') this.router.navigate(['/quotations', q.id, 'edit']);
    if (action === 'Duplicate') {
      const id = this.qs.duplicate(q.id);
      this.toast.notify(`Duplicated as ${id}`);
    }
    if (action === 'Archive') {
      this.qs.archive(q.id);
      this.toast.notify('Quotation archived');
    }
    if (action === 'Delete' && confirm(`Move ${q.id} to Trash?`)) {
      this.qs.trash(q.id);
      this.toast.notify('Quotation moved to Trash');
    }
    if (action === 'Restore') {
      this.qs.restore(q.id);
      this.toast.notify('Quotation restored');
    }
    if (action === 'Convert') {
      const inv = this.qs.convert(q.id);
      this.toast.notify(`Converted to ${inv}`);
    }
    if (action === 'PDF') this.toast.notify(`${q.id} PDF prepared`);
  }
  protected bulk(action: string) {
    for (const id of this.selected()) {
      if (action === 'Archive') this.qs.archive(id);
      if (action === 'Delete') this.qs.trash(id);
      if (action === 'Restore') this.qs.restore(id);
    }
    this.toast.notify(`${action} applied to ${this.selected().size} quotations`);
    this.selected.set(new Set());
  }
  protected clear() {
    this.query.set('');
    this.status.set('All');
    this.converted.set('All');
    this.email.set('All');
  }
}
