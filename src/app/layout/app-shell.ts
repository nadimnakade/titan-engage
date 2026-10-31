import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PrototypeStore } from '../data/prototype-store';

@Component({
  selector: 'app-shell', imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html', styleUrl: './app-shell.css'
})
export class AppShell {
  protected store = inject(PrototypeStore);
  protected mobileOpen = signal(false);
  protected profileOpen = signal(false);
  protected notificationsOpen = signal(false);
  protected nav = [
    ['⌂','Dashboard','/dashboard'], ['◇','Quotations','/quotations'], ['▤','Invoices','/invoices'],
    ['♙','Customers','/customers'], ['▣','Products & Services','/products'], ['＄','Payments','/payments'],
    ['⚙','Tax Management','/taxes'], ['▥','Reports','/reports'], ['◉','Branding & Templates','/branding'], ['⚙','Settings','/settings']
  ];
}
