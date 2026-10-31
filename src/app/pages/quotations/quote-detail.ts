import { Component,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute,Router,RouterLink } from '@angular/router';
import { QuotationStore } from '../../data/quotation-store';
import { PrototypeStore } from '../../data/prototype-store';
@Component({selector:'app-quote-detail',imports:[FormsModule,RouterLink],templateUrl:'./quote-detail.html',styleUrl:'./quote-detail.css'})
export class QuoteDetailPage{
 protected qs=inject(QuotationStore);protected toast=inject(PrototypeStore);private route=inject(ActivatedRoute);private router=inject(Router);
 protected quote=this.qs.get(this.route.snapshot.paramMap.get('id')!)!;protected tab=signal('Details');protected emailOpen=signal(false);protected to=signal(this.quote?.email||'');protected subject=signal(`Quotation ${this.quote?.id} from Acme Trading Ltd`);protected body=signal(`Hello ${this.quote?.customer},\n\nPlease find attached our quotation ${this.quote?.id}. It is valid until ${this.quote?.validUntil}.\n\nRegards,\nAcme Trading Ltd`);protected status=signal(this.quote?.status||'Active');
 protected send(){this.qs.sendEmail(this.quote.id,this.to(),this.subject());this.quote=this.qs.get(this.quote.id)!;this.emailOpen.set(false);this.toast.notify('Quotation email sent and logged')}
 protected setStatus(){this.qs.patch(this.quote.id,{status:this.status()},`Status changed to ${this.status()}`);this.quote=this.qs.get(this.quote.id)!;this.toast.notify('Quotation status updated')}
 protected convert(){const inv=this.qs.convert(this.quote.id);this.quote=this.qs.get(this.quote.id)!;this.toast.notify(`Converted to ${inv}`)}
 protected archive(){this.qs.archive(this.quote.id);this.router.navigate(['/quotations'])}
 protected attrPairs(value:Record<string,string|number|boolean|string[]>){return Object.entries(value)}
}
