import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-shell').then(m => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard').then(m => m.DashboardPage) },
      { path: 'quotations', loadComponent: () => import('./pages/document-list').then(m => m.DocumentListPage), data: { type: 'quotation' } },
      { path: 'quotations/new', loadComponent: () => import('./pages/document-editor').then(m => m.DocumentEditorPage), data: { type: 'quotation' } },
      { path: 'invoices', loadComponent: () => import('./pages/document-list').then(m => m.DocumentListPage), data: { type: 'invoice' } },
      { path: 'invoices/new', loadComponent: () => import('./pages/document-editor').then(m => m.DocumentEditorPage), data: { type: 'invoice' } },
      { path: ':section', loadComponent: () => import('./pages/module-page').then(m => m.ModulePage) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
