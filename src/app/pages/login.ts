import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore, DEMO_ACCOUNTS, DemoAccount } from '../data/auth-store';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: ` <main class="login-page">
    <section class="login-brand">
      <div class="mark">T</div>
      <h1>TITAN <em>ENGAGE</em></h1>
      <p>Business. Billing. Beyond.</p>
    </section>
    <form (ngSubmit)="submit()" class="login-card">
      <span class="eyebrow">SECURE WORKSPACE</span>
      <h2>Welcome back</h2>
      <p>Sign in to manage quotes, invoices and supplier orders.</p>
      <label
        >Email address<input
          type="email"
          name="email"
          autocomplete="email"
          [(ngModel)]="email"
          required
      /></label>
      <label
        >Password<input
          type="password"
          name="password"
          autocomplete="current-password"
          [(ngModel)]="password"
          required
      /></label>
      @if (error()) {
        <div class="error" role="alert">{{ error() }}</div>
      }
      <button type="submit">Sign in</button>
      <div class="demo-title">Demo accounts</div>
      <div class="demo-accounts">
        @for (account of accounts; track account.email) {
          <button type="button" class="demo-account" (click)="useAccount(account)">
            <span
              ><b>{{ account.name }}</b
              ><small>{{ account.role }}</small></span
            ><code>{{ account.email }}<br />{{ account.password }}</code>
          </button>
        }
      </div>
    </form>
  </main>`,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #eef5f8;
        font-family: Inter, Arial;
      }
      .login-page {
        min-height: 100vh;
        display: grid;
        grid-template-columns: minmax(340px, 0.85fr) minmax(420px, 1.15fr);
      }
      .login-brand {
        display: grid;
        place-content: center;
        text-align: center;
        color: #fff;
        background: radial-gradient(circle at 30% 20%, #12657c, #062f49 62%, #03263c);
        padding: 48px;
      }
      .mark {
        width: 72px;
        height: 72px;
        margin: auto;
        display: grid;
        place-items: center;
        border-radius: 20px;
        background: linear-gradient(145deg, #40e2e7, #1671ed);
        font-size: 38px;
        font-weight: 900;
      }
      .login-brand h1 {
        margin: 22px 0 5px;
        font-size: 32px;
        letter-spacing: 1px;
      }
      .login-brand em {
        font-style: normal;
        color: #49dce4;
      }
      .login-brand p {
        text-transform: uppercase;
        letter-spacing: 3px;
        font-size: 11px;
        color: #b4d5df;
      }
      .login-card {
        width: min(470px, calc(100% - 40px));
        margin: auto;
        padding: 40px;
        background: #fff;
        border: 1px solid #dce6ee;
        border-radius: 18px;
        box-shadow: 0 24px 70px #0b30401a;
      }
      .eyebrow {
        color: #087f8d;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.4px;
      }
      .login-card h2 {
        font-size: 30px;
        margin: 10px 0 5px;
        color: #10263e;
      }
      .login-card > p {
        color: #6b7f92;
        margin: 0 0 28px;
      }
      .login-card label {
        display: grid;
        gap: 7px;
        margin: 16px 0;
        color: #29435e;
        font-size: 13px;
        font-weight: 700;
      }
      .login-card input {
        height: 48px;
        padding: 0 14px;
        border: 1px solid #ccd9e5;
        border-radius: 9px;
        font: inherit;
      }
      .login-card input:focus {
        outline: 3px solid #1ebcc522;
        border-color: #159ea8;
      }
      .login-card button {
        width: 100%;
        height: 50px;
        margin-top: 8px;
        border: 0;
        border-radius: 9px;
        background: #087a8a;
        color: #fff;
        font-size: 14px;
        font-weight: 800;
      }
      .login-card small {
        display: block;
        text-align: center;
        color: #8494a4;
        margin-top: 14px;
      }
      .demo-title {
        margin: 22px 0 8px;
        color: #6b7f92;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .demo-accounts {
        display: grid;
        gap: 7px;
      }
      .login-card .demo-account {
        height: auto;
        margin: 0;
        padding: 9px 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid #dbe6eb;
        background: #f8fbfc;
        color: #203a50;
        text-align: left;
      }
      .demo-account:hover {
        border-color: #42aab3;
        background: #effafa;
      }
      .demo-account b,
      .demo-account small {
        display: block;
      }
      .demo-account small {
        margin: 2px 0 0;
        text-align: left;
        color: #728497;
        font-size: 9px;
      }
      .demo-account code {
        font-size: 9px;
        color: #466477;
        text-align: right;
      }
      .error {
        padding: 10px;
        border-radius: 8px;
        background: #fff0f0;
        color: #b42318;
        font-size: 12px;
      }
      @media (max-width: 760px) {
        .login-page {
          grid-template-columns: 1fr;
        }
        .login-brand {
          min-height: 240px;
          padding: 30px;
        }
        .login-card {
          margin: 30px auto;
        }
      }
    `,
  ],
})
export class LoginPage {
  private auth = inject(AuthStore);
  accounts = DEMO_ACCOUNTS;
  email = DEMO_ACCOUNTS[0].email;
  password = DEMO_ACCOUNTS[0].password;
  error = signal('');
  submit() {
    if (!this.auth.login(this.email, this.password))
      this.error.set('Those credentials do not match a demo account. Choose one below.');
  }
  useAccount(account: DemoAccount) {
    this.email = account.email;
    this.password = account.password;
    this.error.set('');
  }
}
