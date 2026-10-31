import { Injectable, computed, inject, signal } from '@angular/core';
import { PrototypeStore } from './prototype-store';

export type QuoteStatus='Active'|'Closed'|'Rejected';
export type QuoteVisibility='Normal'|'Archived'|'Trash';
export type EmailState='Not sent'|'Sent'|'Failed';
export interface QuoteItem{id:string;name:string;description:string;qty:number;price:number;discount:number;tax:number;template:string;attributes:Record<string,string|number|boolean|string[]>}
export interface QuoteAudit{id:string;action:string;actor:string;at:string}
export interface QuoteRecord{id:string;customer:string;email:string;created:string;validUntil:string;currency:string;status:QuoteStatus;visibility:QuoteVisibility;emailState:EmailState;invoice?:string;total:number;items:QuoteItem[];notes:string;archivedBeforeDelete?:boolean;audit:QuoteAudit[]}
export interface CustomField{id:string;label:string;type:string;section:string;required:boolean;pdf:boolean;enabled:boolean;options:string[];condition?:string}
export interface ProductTemplate{id:string;name:string;category:string;fields:string[];published:boolean}

const defaultFields:CustomField[]=[
 {id:'fld-type',label:'Blind type',type:'Dropdown',section:'Product specifications',required:true,pdf:true,enabled:true,options:['Roller','Roman','Venetian','Vertical']},
 {id:'fld-model',label:'Model',type:'Short text',section:'Product specifications',required:true,pdf:true,enabled:true,options:[]},
 {id:'fld-width',label:'Width',type:'Measurement',section:'Dimensions',required:true,pdf:true,enabled:true,options:['mm','cm','m','in']},
 {id:'fld-height',label:'Height',type:'Measurement',section:'Dimensions',required:true,pdf:true,enabled:true,options:['mm','cm','m','in']},
 {id:'fld-mechanism',label:'Mechanism',type:'Radio group',section:'Operation',required:true,pdf:true,enabled:true,options:['Manual','Motorised']},
 {id:'fld-opening',label:'Opening direction',type:'Dropdown',section:'Operation',required:false,pdf:true,enabled:true,options:['Up','Down','Full Left','Full Right','Split Middle']},
 {id:'fld-string',label:'Operating string location',type:'Dropdown',section:'Operation',required:false,pdf:true,enabled:true,options:['Left','Right','Both','N/A'],condition:'Mechanism = Manual'},
 {id:'fld-colour',label:'Colour',type:'Colour',section:'Finish',required:false,pdf:true,enabled:true,options:['White','Charcoal','Sand','Custom']}
];
const defaultTemplates:ProductTemplate[]=[{id:'tpl-blinds',name:'Window blinds',category:'Window coverings',fields:defaultFields.map(f=>f.id),published:true},{id:'tpl-auto',name:'Automotive parts',category:'Automotive',fields:[],published:true},{id:'tpl-service',name:'Custom service',category:'Services',fields:[],published:true}];
const item=(id:string,name:string,price:number):QuoteItem=>({id,name,description:'Configured product or professional service',qty:1,price,discount:0,tax:20,template:'Window blinds',attributes:{'Blind type':'Roller','Model':'Premium Blackout','Width':'180 cm','Height':'160 cm','Mechanism':'Manual','Opening direction':'Down','Operating string location':'Right','Colour':'Charcoal'}});
const seeds:QuoteRecord[]=[
 {id:'Q-2026-0052',customer:'Acme Corporation',email:'accounts@acme.demo',created:'31 Oct 2026',validUntil:'30 Nov 2026',currency:'USD',status:'Active',visibility:'Normal',emailState:'Sent',total:12480,items:[item('i1','Roller Blind',520)],notes:'Installation included.',audit:[]},
 {id:'Q-2026-0051',customer:'Smith Residence',email:'smith@example.demo',created:'30 Oct 2026',validUntil:'29 Nov 2026',currency:'USD',status:'Closed',visibility:'Normal',emailState:'Not sent',total:7650,items:[item('i2','Motorised Roman Blind',850)],notes:'',audit:[]},
 {id:'Q-2026-0050',customer:'John Doe',email:'john@example.demo',created:'28 Oct 2026',validUntil:'27 Nov 2026',currency:'USD',status:'Rejected',visibility:'Normal',emailState:'Failed',total:4600,items:[item('i3','Venetian Blind',460)],notes:'',audit:[]},
 {id:'Q-2026-0049',customer:'Elite Interiors',email:'sales@elite.demo',created:'25 Oct 2026',validUntil:'24 Nov 2026',currency:'USD',status:'Active',visibility:'Normal',emailState:'Sent',invoice:'INV-2026-0049',total:8200,items:[item('i4','Vertical Blind',820)],notes:'',audit:[]},
 {id:'Q-2026-0048',customer:'Green Homes Ltd',email:'hello@greenhomes.demo',created:'20 Oct 2026',validUntil:'19 Nov 2026',currency:'USD',status:'Active',visibility:'Normal',emailState:'Not sent',total:15300,items:[item('i5','Roller Blind',510)],notes:'',audit:[]},
 {id:'Q-2026-0047',customer:'Modern Spaces',email:'studio@modern.demo',created:'18 Oct 2026',validUntil:'17 Nov 2026',currency:'USD',status:'Closed',visibility:'Archived',emailState:'Sent',total:6100,items:[item('i6','Roman Blind',610)],notes:'',audit:[]},
 {id:'Q-2026-0046',customer:'Oldtown Retail',email:'admin@oldtown.demo',created:'12 Oct 2026',validUntil:'11 Nov 2026',currency:'USD',status:'Rejected',visibility:'Trash',emailState:'Not sent',total:2950,items:[item('i7','Venetian Blind',295)],notes:'',archivedBeforeDelete:false,audit:[]}
];

@Injectable({providedIn:'root'}) export class QuotationStore{
 private documents=inject(PrototypeStore);
 private quoteKey='titan-quotes-v2';private fieldKey='titan-quote-fields';private templateKey='titan-quote-templates';
 readonly quotes=signal<QuoteRecord[]>(this.load(this.quoteKey,seeds));readonly fields=signal<CustomField[]>(this.load(this.fieldKey,defaultFields));readonly templates=signal<ProductTemplate[]>(this.load(this.templateKey,defaultTemplates));readonly activeCount=computed(()=>this.quotes().filter(q=>q.visibility==='Normal'&&q.status==='Active'&&!q.invoice).length);
 private load<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}}
 private save(){localStorage.setItem(this.quoteKey,JSON.stringify(this.quotes()));localStorage.setItem(this.fieldKey,JSON.stringify(this.fields()));localStorage.setItem(this.templateKey,JSON.stringify(this.templates()))}
 get(id:string){return this.quotes().find(q=>q.id===id)}
 upsert(q:QuoteRecord){this.quotes.update(all=>[q,...all.filter(x=>x.id!==q.id)]);this.save()}
 duplicate(id:string){const q=this.get(id);if(!q)return;const next=`Q-2026-${String(Math.max(...this.quotes().map(x=>+x.id.split('-').pop()!))+1).padStart(4,'0')}`;this.upsert({...structuredClone(q),id:next,status:'Active',visibility:'Normal',invoice:undefined,emailState:'Not sent',created:'31 Oct 2026',audit:[{id:crypto.randomUUID(),action:`Duplicated from ${id}`,actor:'John Smith',at:'Just now'}]});return next}
 patch(id:string,change:Partial<QuoteRecord>,action:string){this.quotes.update(all=>all.map(q=>q.id===id?{...q,...change,audit:[{id:crypto.randomUUID(),action,actor:'John Smith',at:'Just now'},...q.audit]}:q));this.save()}
 archive(id:string){this.patch(id,{visibility:'Archived'},'Quotation archived')}restore(id:string){const q=this.get(id);this.patch(id,{visibility:q?.visibility==='Trash'&&q.archivedBeforeDelete?'Archived':'Normal'},'Quotation restored')}trash(id:string){const q=this.get(id);this.patch(id,{visibility:'Trash',archivedBeforeDelete:q?.visibility==='Archived'},'Moved to trash')}
 convert(id:string){
  const q=this.get(id);
  if(!q||q.invoice||q.visibility==='Trash')return q?.invoice;
  const invoice=q.id.replace(/^Q-/,'INV-');
  this.patch(id,{invoice},`Converted to ${invoice}`);
  this.documents.save({id:invoice,kind:'invoice',customer:q.customer,date:q.created,due:q.validUntil,total:q.total,paid:0,status:'Draft'});
  return invoice;
 }
 sendEmail(id:string,recipient:string,subject:string){this.patch(id,{emailState:'Sent'},`Email sent to ${recipient}: ${subject}`)}
 saveField(field:CustomField){this.fields.update(all=>[field,...all.filter(f=>f.id!==field.id)]);this.save()}deleteField(id:string){this.fields.update(all=>all.filter(f=>f.id!==id));this.templates.update(all=>all.map(t=>({...t,fields:t.fields.filter(f=>f!==id)})));this.save()}
 saveTemplate(t:ProductTemplate){this.templates.update(all=>[t,...all.filter(x=>x.id!==t.id)]);this.save()}
}
