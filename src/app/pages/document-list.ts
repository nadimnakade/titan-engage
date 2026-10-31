import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PrototypeStore, DocumentKind } from '../data/prototype-store';

@Component({selector:'app-document-list',imports:[RouterLink],templateUrl:'./document-list.html',styleUrl:'./document-list.css'})
export class DocumentListPage {
  protected store=inject(PrototypeStore); private route=inject(ActivatedRoute);
  protected kind=this.route.snapshot.data['type'] as DocumentKind; protected query=signal(''); protected status=signal('All statuses'); protected page=signal(1);
  protected title=this.kind==='invoice'?'Invoices':'Quotations'; protected singular=this.kind==='invoice'?'Invoice':'Quotation';
  protected filtered=computed(()=>this.store.documents().filter(d=>d.kind===this.kind&&(`${d.id} ${d.customer}`.toLowerCase().includes(this.query().toLowerCase()))&&(this.status()==='All statuses'||d.status===this.status())));
  protected pendingTotal=computed(()=>this.filtered().reduce((sum,d)=>sum+(this.kind==='invoice'?d.total-d.paid:d.total),0));
  protected remove(id:string){if(confirm('Delete this draft? This action cannot be undone.'))this.store.remove(id)}
  protected download(id:string){this.store.notify(`${id} PDF preview generated`)}
}
