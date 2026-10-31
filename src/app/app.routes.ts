import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-shell').then(m => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard').then(m => m.DashboardPage) },
      { path: 'quotations', loadComponent: () => import('./pages/quotations/quote-list').then(m => m.QuoteListPage) },
      { path: 'quotations/new', loadComponent: () => import('./pages/document-editor').then(m => m.DocumentEditorPage), data: { type: 'quotation' } },
      { path: 'quotations/:id/edit', loadComponent: () => import('./pages/document-editor').then(m => m.DocumentEditorPage), data: { type: 'quotation' } },
      { path: 'quotations/:id', loadComponent: () => import('./pages/quotations/quote-detail').then(m => m.QuoteDetailPage) },
      { path: 'invoices', loadComponent: () => import('./pages/document-list').then(m => m.DocumentListPage), data: { type: 'invoice' } },
      { path: 'invoices/new', loadComponent: () => import('./pages/document-editor').then(m => m.DocumentEditorPage), data: { type: 'invoice' } },
      { path: 'settings/quotations', loadComponent: () => import('./pages/quotations/quote-settings').then(m => m.QuoteSettingsPage) },
      { path: ':section', loadComponent: () => import('./pages/module-page').then(m => m.ModulePage) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
