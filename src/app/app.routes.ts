import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthStore } from './data/auth-store';

const signedInGuard = () =>
  inject(AuthStore).signedIn() || inject(Router).createUrlTree(['/login']);

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login').then((m) => m.LoginPage) },
  {
    path: '',
    canActivate: [signedInGuard],
    loadComponent: () => import('./layout/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'quotations',
        loadComponent: () => import('./pages/quotations/quote-list').then((m) => m.QuoteListPage),
      },
      {
        path: 'quotations/new',
        loadComponent: () => import('./pages/document-editor').then((m) => m.DocumentEditorPage),
        data: { type: 'quotation' },
      },
      {
        path: 'quotations/:id/edit',
        loadComponent: () => import('./pages/document-editor').then((m) => m.DocumentEditorPage),
        data: { type: 'quotation' },
      },
      {
        path: 'quotations/:id',
        loadComponent: () =>
          import('./pages/quotations/quote-detail').then((m) => m.QuoteDetailPage),
      },
      {
        path: 'invoices',
        loadComponent: () => import('./pages/document-list').then((m) => m.DocumentListPage),
        data: { type: 'invoice' },
      },
      {
        path: 'invoices/new',
        loadComponent: () => import('./pages/document-editor').then((m) => m.DocumentEditorPage),
        data: { type: 'invoice' },
      },
      {
        path: 'invoices/:id',
        loadComponent: () => import('./pages/document-editor').then((m) => m.DocumentEditorPage),
        data: { type: 'invoice' },
      },
      {
        path: 'supplier-orders',
        loadComponent: () =>
          import('./pages/supplier-orders/supplier-orders').then((m) => m.SupplierOrdersPage),
      },
      {
        path: 'settings/quotations',
        loadComponent: () =>
          import('./pages/quotations/quote-settings').then((m) => m.QuoteSettingsPage),
      },
      { path: 'settings', pathMatch: 'full', redirectTo: 'settings/quotations' },
      {
        path: 'customers',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
        data: { section: 'customers' },
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
        data: { section: 'products' },
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
        data: { section: 'payments' },
      },
      {
        path: 'taxes',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
        data: { section: 'taxes' },
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
        data: { section: 'reports' },
      },
      {
        path: 'reports/accounting/invoice-register',
        loadComponent: () =>
          import('./pages/reports/invoice-register').then((m) => m.InvoiceRegisterPage),
      },
      {
        path: 'branding',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
        data: { section: 'branding' },
      },
      {
        path: 'settings/organization',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
        data: { section: 'settings' },
      },
      {
        path: ':section',
        loadComponent: () => import('./pages/module-page').then((m) => m.ModulePage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
