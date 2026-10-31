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
  protected nav = [
    ['dashboard','Dashboard','/dashboard'], ['quote','Quotations','/quotations'], ['invoice','Invoices','/invoices'],
    ['customers','Customers','/customers'], ['products','Products & Services','/products'], ['payments','Payments','/payments'],
    ['taxes','Tax Management','/taxes'], ['reports','Reports','/reports'], ['branding','Branding & Templates','/branding'], ['settings','Settings','/settings/quotations']
  ];
}
