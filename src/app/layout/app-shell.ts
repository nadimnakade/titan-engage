import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PrototypeStore } from '../data/prototype-store';
import { UiIcon } from '../shared/ui-icon';

@Component({
  selector: 'app-shell', imports: [RouterOutlet, RouterLink, RouterLinkActive, UiIcon],
  templateUrl: './app-shell.html', styleUrl: './app-shell.css'
})
export class AppShell {
  protected store = inject(PrototypeStore);
  protected mobileOpen = signal(false);
  protected profileOpen = signal(false);
  protected notificationsOpen = signal(false);
  protected navGroups = [
    { label:'Business', items:[['quote','Quotes','/quotations'],['invoice','Invoices','/invoices'],['customers','Customers','/customers']] },
    { label:'Supplies', items:[['supplier','Supplier Orders','/supplier-orders'],['products','Products & Services','/products'],['expenses','Expenses','/payments']] },
    { label:'Insights', items:[['dashboard','Dashboard','/dashboard'],['reports','Reports','/reports'],['taxes','Tax Management','/taxes']] },
    { label:'Settings', items:[['branding','Branding & Templates','/branding'],['settings','Settings','/settings/quotations']] }
  ];
}
