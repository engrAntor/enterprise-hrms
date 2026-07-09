import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <!-- Left Panel — Illustration -->
      <div class="login-left">
        <div class="left-content">
          <img src="assets/images/hr-login.png" alt="HR Management" class="hero-img" />
          <h2 class="hero-title">ENTERPRISE HR PLATFORM</h2>
          <p class="hero-tagline">Scale your team, unlock global potential.</p>
        </div>
      </div>

      <!-- Right Panel — Form -->
      <div class="login-right">
        <button class="theme-toggle" (click)="themeService.toggleTheme()">
          <svg *ngIf="themeService.currentTheme() === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg *ngIf="themeService.currentTheme() === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
        </button>

        <div class="form-container">
          <!-- Logo centered -->
          <div class="logo-mark">
            <svg viewBox="0 0 200 160" fill="none">
              <circle cx="130" cy="42" r="28" stroke="#9DA4D0" stroke-width="5" fill="none"/>
              <path d="M130 70 C100 70 82 95 82 115 L178 115 C178 95 160 70 130 70Z" stroke="#9DA4D0" stroke-width="5" fill="none"/>
              <circle cx="70" cy="50" r="22" stroke="#2D2B55" stroke-width="4" fill="none"/>
              <path d="M70 72 C48 72 34 92 34 108 L106 108 C106 92 92 72 70 72Z" stroke="#2D2B55" stroke-width="4" fill="none"/>
              <circle cx="100" cy="38" r="20" fill="#9DA4D0"/>
              <path d="M100 58 C78 58 62 80 62 100 L138 100 C138 80 122 58 100 58Z" fill="#9DA4D0"/>
              <circle cx="100" cy="60" r="16" fill="#1B1D3A"/>
              <path d="M100 76 C82 76 70 94 70 110 L130 110 C130 94 118 76 100 76Z" fill="#1B1D3A"/>
            </svg>
          </div>

          <h2>Log in to continue</h2>
          <p class="form-subtitle">Please share your email to take the next step forward</p>

          <div class="alert-error" *ngIf="error()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ error() }}
          </div>

          <form (ngSubmit)="onLogin()">
            <div class="field">
              <div class="field-label-inline">Email</div>
              <div class="field-divider"></div>
              <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email address" required>
            </div>

            <div class="field">
              <div class="field-label-inline">Password</div>
              <div class="field-divider"></div>
              <input [type]="showPw() ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Enter your password" required>
              <button type="button" class="pw-toggle" (click)="showPw.set(!showPw())">
                <svg *ngIf="!showPw()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showPw()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>

            <div class="form-options">
              <label class="checkbox-wrap">
                <input type="checkbox" checked> Remember Password
              </label>
              <a href="#" class="forgot-link">Forgot Password ?</a>
            </div>

            <button type="submit" class="login-btn" [disabled]="loading()">
              <span *ngIf="!loading()">Login</span>
              <span *ngIf="loading()" class="spinner"></span>
            </button>
          </form>

          <p class="demo-hint" *ngIf="false"></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display: flex; min-height: 100vh; }

    /* Left Panel */
    .login-left {
      flex: 1;
      background: linear-gradient(160deg, #1B1D3A 0%, #2D2B55 50%, #3F3D73 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 60px; overflow: hidden;
      position: relative;
    }
    .login-left::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(99,91,255,0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0,194,209,0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    .left-content {
      text-align: center; max-width: 520px;
      animation: fadeIn 0.7s ease both;
      position: relative; z-index: 1;
    }
    .hero-img {
      width: 100%; max-width: 460px; height: auto;
      margin-bottom: 36px;
      border-radius: 16px;
      filter: drop-shadow(0 12px 40px rgba(0,0,0,0.3));
    }
    .hero-title {
      font-size: 24px; font-weight: 900; color: #FFFFFF;
      letter-spacing: 2.5px; text-transform: uppercase;
    }
    .hero-tagline { font-size: 16px; color: rgba(255,255,255,0.55); font-style: italic; margin-top: 8px; }

    /* Right Panel */
    .login-right {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: #FFFFFF; padding: 48px; position: relative;
    }
    [data-theme="dark"] .login-right {
      background: var(--bg-body);
    }
    .theme-toggle {
      position: absolute; top: 28px; right: 28px;
      width: 44px; height: 44px; border-radius: var(--radius-md);
      background: var(--bg-surface); border: 1.5px solid var(--border-color);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all var(--transition-fast);
      svg { width: 19px; height: 19px; color: var(--text-secondary); }
      &:hover { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.12); }
    }

    .form-container {
      width: 100%; max-width: 480px;
      text-align: center;
      animation: slideIn 0.5s ease both;
    }

    /* Logo centered */
    .logo-mark {
      width: 110px; height: 88px;
      margin: 0 auto 28px;
      svg { width: 100%; height: 100%; }
    }

    .form-container h2 {
      font-size: 34px; font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
      margin-bottom: 10px;
    }
    .form-subtitle {
      font-size: 16px; color: var(--text-secondary);
      margin-bottom: 38px;
    }

    .alert-error {
      background: rgba(255,82,82,0.06); color: var(--danger);
      padding: 14px 18px; border-radius: var(--radius-md);
      font-size: 15px; font-weight: 500;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      margin-bottom: 24px; text-align: left;
      border: 1px solid rgba(255,82,82,0.12);
      svg { width: 18px; height: 18px; flex-shrink: 0; }
    }

    /* Fields */
    .field {
      display: flex; align-items: center;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      margin-bottom: 20px;
      transition: all var(--transition-fast);
      position: relative;
      &:focus-within {
        border-color: var(--primary);
        box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
      }
    }
    .field-label-inline {
      padding: 16px 20px;
      font-size: 15px; font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap; min-width: 110px;
    }
    .field-divider { width: 1.5px; height: 26px; background: var(--border-color); flex-shrink: 0; }
    .field input {
      flex: 1; border: none; background: none;
      padding: 16px 20px; font-size: 16px;
      color: var(--text-primary); outline: none;
      &::placeholder { color: var(--text-muted); }
    }
    .pw-toggle {
      position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; padding: 4px;
      svg { width: 22px; height: 22px; color: var(--text-muted); }
      &:hover svg { color: var(--text-secondary); }
    }

    .form-options {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 32px;
    }
    .checkbox-wrap {
      display: flex; align-items: center; gap: 9px;
      font-size: 15px; font-weight: 500;
      color: var(--text-primary); cursor: pointer;
      input { accent-color: var(--primary); width: 18px; height: 18px; }
    }
    .forgot-link { font-size: 15px; font-weight: 600; color: var(--primary); }

    .login-btn {
      width: 100%; height: 58px;
      background: linear-gradient(135deg, #1B1D3A 0%, #2D2B55 100%);
      color: white; border: none; border-radius: var(--radius-md);
      font-size: 18px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 16px rgba(27,29,58,0.3);
      transition: all var(--transition-fast);
      &:hover { box-shadow: 0 8px 28px rgba(27,29,58,0.4); transform: translateY(-2px); }
      &:active { transform: scale(0.98); }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }
    [data-theme="dark"] .login-btn {
      background: linear-gradient(135deg, #635BFF, #8078FF);
      box-shadow: 0 4px 16px rgba(99,91,255,0.35);
    }

    .spinner {
      width: 24px; height: 24px;
      border: 2.5px solid rgba(255,255,255,0.25);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .demo-hint {
      text-align: center; margin-top: 28px;
      font-size: 13px; color: var(--text-muted);
      display: flex; align-items: center; justify-content: center; gap: 6px;
      svg { width: 15px; height: 15px; }
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .login-page { flex-direction: column; }
      .login-left { padding: 40px 20px; min-height: 280px; }
      .hero-img { max-width: 280px; }
      .hero-title { font-size: 18px; }
      .login-right { padding: 32px 20px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPw = signal(false);

  constructor(private authService: AuthService, private router: Router, public themeService: ThemeService) {}

  async onLogin() {
    if (!this.email || !this.password) { this.error.set('Please fill in all fields'); return; }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.login({ email: this.email, password: this.password });
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message || 'Login failed. Please check your credentials.');
    }
    finally { this.loading.set(false); }
  }
}
