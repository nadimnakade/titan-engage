import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PrototypeStore, DocumentKind } from '../data/prototype-store';
import { UiIcon } from '../shared/ui-icon';

@Component({
  selector: 'app-document-list',
  imports: [RouterLink, UiIcon],
  templateUrl: './document-list.html',
  styleUrl: './document-list.css',
})
export class DocumentListPage {
  protected store = inject(PrototypeStore);
  private route = inject(ActivatedRoute);
  protected kind = this.route.snapshot.data['type'] as DocumentKind;
  protected query = signal('');
  protected status = signal('All');
  protected page = signal(1);
  protected menu = signal<string | null>(null);
  protected pageSize = 8;
  protected title = this.kind === 'invoice' ? 'Invoices' : 'Quotations';
  protected singular = this.kind === 'invoice' ? 'Invoice' : 'Quotation';
  protected views = ['All', 'Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue'];
  protected filtered = computed(() =>
    this.store
      .documents()
      .filter(
        (d) =>
          d.kind === this.kind &&
          `${d.id} ${d.customer}`.toLowerCase().includes(this.query().toLowerCase()) &&
          (this.status() === 'All' || d.status === this.status()),
      ),
  );
  protected visible = computed(() =>
    this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  protected pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  protected pendingTotal = computed(() =>
    this.filtered().reduce(
      (sum, d) => sum + (this.kind === 'invoice' ? d.total - d.paid : d.total),
      0,
    ),
  );
  protected remove(id: string) {
    if (confirm('Delete this draft? This action cannot be undone.')) this.store.remove(id);
  }
  protected download(id: string) {
    this.store.notify(`${id} opened in print-ready PDF view`);
    window.print();
  }
  protected send(d: any) {
    this.store.save({ ...d, status: 'Sent to customer' });
    this.menu.set(null);
    this.store.notify(`${d.id} sent to ${d.customer}`);
  }
  protected chooseView(view: string) {
    this.status.set(view);
    this.page.set(1);
  }
  protected viewCount(view: string) {
    return this.store
      .documents()
      .filter((d) => d.kind === this.kind && (view === 'All' || d.status === view)).length;
  }
  protected goToPage(value: number) {
    this.page.set(Math.min(this.pages(), Math.max(1, value)));
  }
}
