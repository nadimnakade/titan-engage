import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: string;
  initials: string;
}
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@titan.demo',
    password: 'Admin123',
    name: 'John Smith',
    role: 'Administrator',
    initials: 'JS',
  },
  {
    email: 'billing@titan.demo',
    password: 'Billing123',
    name: 'Maya Patel',
    role: 'Billing Manager',
    initials: 'MP',
  },
  {
    email: 'sales@titan.demo',
    password: 'Sales123',
    name: 'Alex Morgan',
    role: 'Sales Executive',
    initials: 'AM',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly key = 'titan-demo-session';
  readonly user = signal<DemoAccount | null>(this.readUser());
  readonly signedIn = signal(!!this.user());

  constructor(private router: Router) {}

  login(email: string, password: string) {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );
    if (!account) return false;
    sessionStorage.setItem(this.key, JSON.stringify(account));
    this.user.set(account);
    this.signedIn.set(true);
    this.router.navigateByUrl('/dashboard');
    return true;
  }

  logout() {
    sessionStorage.removeItem(this.key);
    this.user.set(null);
    this.signedIn.set(false);
    this.router.navigateByUrl('/login');
  }
  private readUser(): DemoAccount | null {
    try {
      const saved = sessionStorage.getItem(this.key);
      if (!saved) return null;
      if (saved === 'active') return DEMO_ACCOUNTS[0];
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
}
