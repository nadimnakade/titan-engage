import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrototypeStore } from '../data/prototype-store';

@Component({ selector:'app-dashboard', imports:[RouterLink], templateUrl:'./dashboard.html', styleUrl:'./dashboard.css' })
export class DashboardPage {
  protected store=inject(PrototypeStore); protected range=signal('This year');
  protected months=[48,63,51,74,68,82,76,91,88,105,111,128];
  protected collected=[34,48,39,58,55,67,64,78,72,91,98,112];
  protected activities=[['▣','Quote Q-2026-0048 sent to Global Tech Ltd','2 hours ago'],['✓','Invoice INV-2026-0125 paid','5 hours ago'],['♙','New customer added: Horizon Solutions','Yesterday'],['◇','Quote Q-2026-0047 accepted','Yesterday'],['!','Invoice INV-2026-0123 is overdue','2 days ago']];
}
