import { Component, input } from '@angular/core';

@Component({selector:'ui-icon',template:`<svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
@switch(name()){
  @case('dashboard'){<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>}
  @case('quote'){<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h4"/>}
  @case('invoice'){<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h3"/>}
  @case('customers'){<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>}
  @case('products'){<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>}
  @case('payments'){<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h3"/>}
  @case('taxes'){<circle cx="12" cy="12" r="9"/><path d="m8.5 15.5 7-7M9 9h.01M15 15h.01"/>}
  @case('reports'){<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>}
  @case('branding'){<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1-2l-1-1c-.7-.8-.2-2 1-2h2a6 6 0 0 0 6-6c0-4-4-7-9-7z"/><circle cx="7.5" cy="10" r=".5"/><circle cx="10" cy="7" r=".5"/><circle cx="14" cy="7" r=".5"/>}
  @case('settings'){<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.09A1.7 1.7 0 0 0 4.64 9 1.7 1.7 0 0 0 4.3 7.12l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.09A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21v4h-.09A1.7 1.7 0 0 0 19.4 15z"/>}
  @case('search'){<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>}
  @case('bell'){<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>}
  @case('help'){<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.6 1.9c-1.3 1.1-2.1 1.5-2.1 3.1M12 18h.01"/>}
  @case('menu'){<path d="M4 7h16M4 12h16M4 17h16"/>}
  @default{<circle cx="12" cy="12" r="9"/>}
}</svg>`,styles:[`:host{display:inline-grid;place-items:center;line-height:0;flex:0 0 auto}`]})
export class UiIcon{readonly name=input.required<string>();readonly size=input(20)}
