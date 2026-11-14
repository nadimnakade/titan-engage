import { Injectable, computed, signal } from '@angular/core';

export type DocumentKind = 'quotation' | 'invoice';
export interface LineItem { id: number | string; name: string; description: string; qty: number; unit: string; price: number; discount: number; tax: number; productId?: string; madeToMeasure?: boolean; family?: string; specifications?: Record<string, unknown>; }
export interface BusinessDocument { id: string; kind: DocumentKind; customer: string; date: string; due: string; total: number; paid: number; status: string; items?: LineItem[]; }

const seed: BusinessDocument[] = [
  { id:'Q-2026-0048',kind:'quotation',customer:'Global Tech Ltd',date:'28 Oct 2026',due:'27 Nov 2026',total:12480,paid:0,status:'Sent' },
  { id:'Q-2026-0047',kind:'quotation',customer:'Horizon Solutions',date:'26 Oct 2026',due:'25 Nov 2026',total:7290,paid:0,status:'Accepted' },
  { id:'Q-2026-0046',kind:'quotation',customer:'Northstar Retail',date:'23 Oct 2026',due:'22 Nov 2026',total:4380,paid:0,status:'Viewed' },
  { id:'Q-2026-0045',kind:'quotation',customer:'Apex Industries',date:'20 Oct 2026',due:'19 Nov 2026',total:9750,paid:0,status:'Draft' },
  { id:'INV-2026-0126',kind:'invoice',customer:'Global Tech Ltd',date:'21 Oct 2026',due:'20 Nov 2026',total:2899,paid:1600,status:'Partially Paid' },
  { id:'INV-2026-0125',kind:'invoice',customer:'Horizon Solutions',date:'18 Oct 2026',due:'17 Nov 2026',total:5240,paid:5240,status:'Paid' },
  { id:'INV-2026-0124',kind:'invoice',customer:'Northstar Retail',date:'12 Oct 2026',due:'11 Nov 2026',total:3180,paid:0,status:'Issued' },
  { id:'INV-2026-0123',kind:'invoice',customer:'Apex Industries',date:'02 Oct 2026',due:'16 Oct 2026',total:8650,paid:0,status:'Overdue' },
];

@Injectable({ providedIn: 'root' })
export class PrototypeStore {
  private readonly key = 'titan-engage-v1';
  readonly documents = signal<BusinessDocument[]>(this.load());
  readonly toast = signal('');
  readonly totalInvoiced = computed(() => this.documents().filter(d=>d.kind==='invoice').reduce((s,d)=>s+d.total,0));
  readonly totalCollected = computed(() => this.documents().reduce((s,d)=>s+d.paid,0));

  private load() { try { return JSON.parse(localStorage.getItem(this.key) || 'null') || seed; } catch { return seed; } }
  save(document: BusinessDocument) { this.documents.update(all => [document, ...all.filter(d=>d.id!==document.id)]); this.persist(); this.notify(`${document.kind === 'invoice' ? 'Invoice' : 'Quotation'} saved successfully`); }
  remove(id: string) { this.documents.update(all => all.filter(d=>d.id!==id)); this.persist(); this.notify('Draft deleted'); }
  recordPayment(id: string, amount: number) { this.documents.update(all => all.map(d => d.id===id ? {...d, paid:Math.min(d.total,d.paid+amount), status:d.paid+amount>=d.total?'Paid':'Partially Paid'} : d)); this.persist(); this.notify('Payment recorded successfully'); }
  reset() { this.documents.set(seed); this.persist(); this.notify('Demo data restored'); }
  notify(message: string) { this.toast.set(message); window.setTimeout(()=>this.toast.set(''), 2600); }
  private persist() { localStorage.setItem(this.key, JSON.stringify(this.documents())); }
}
