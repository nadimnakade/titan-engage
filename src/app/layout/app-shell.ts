import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PrototypeStore } from '../data/prototype-store';
import { UiIcon } from '../shared/ui-icon';
import { AuthStore } from '../data/auth-store';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiIcon],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  protected store = inject(PrototypeStore);
  protected auth = inject(AuthStore);
  protected mobileOpen = signal(false);
  protected profileOpen = signal(false);
  protected notificationsOpen = signal(false);
  protected notifications = signal([
    {
      title: 'Invoice INV-2026-0126 viewed',
      detail: 'Global Tech Ltd · 12 minutes ago',
      read: false,
    },
    { title: 'Supplier order acknowledged', detail: 'Motion Components · 1 hour ago', read: false },
    { title: 'Quotation Q-2026-0048 accepted', detail: 'Global Tech Ltd · yesterday', read: true },
  ]);
  protected markAllRead() {
    this.notifications.update((all) => all.map((n) => ({ ...n, read: true })));
  }
  protected navGroups = [
    {
      label: 'Business',
      items: [
        ['quote', 'Quotes', '/quotations'],
        ['invoice', 'Invoices', '/invoices'],
        ['customers', 'Customers', '/customers'],
      ],
    },
    {
      label: 'Supplies',
      items: [
        ['supplier', 'Supplier Orders', '/supplier-orders'],
        ['products', 'Products & Services', '/products'],
        ['expenses', 'Expenses', '/payments'],
      ],
    },
    {
      label: 'Insights',
      items: [
        ['dashboard', 'Dashboard', '/dashboard'],
        ['reports', 'Reports', '/reports'],
        ['taxes', 'Tax Management', '/taxes'],
      ],
    },
    {
      label: 'Settings',
      items: [
        ['branding', 'Branding & Templates', '/branding'],
        ['settings', 'Settings', '/settings/quotations'],
      ],
    },
  ];
}
