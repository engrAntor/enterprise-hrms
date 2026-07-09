import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg viewBox="0 0 200 160" fill="none">
            <circle cx="130" cy="42" r="28" stroke="#9DA4D0" stroke-width="5" fill="none"/>
            <path d="M130 70 C100 70 82 95 82 115 L178 115 C178 95 160 70 130 70Z" stroke="#9DA4D0" stroke-width="5" fill="none"/>
            <circle cx="70" cy="50" r="22" stroke="rgba(255,255,255,0.4)" stroke-width="4" fill="none"/>
            <path d="M70 72 C48 72 34 92 34 108 L106 108 C106 92 92 72 70 72Z" stroke="rgba(255,255,255,0.4)" stroke-width="4" fill="none"/>
            <circle cx="100" cy="38" r="20" fill="#9DA4D0"/>
            <path d="M100 58 C78 58 62 80 62 100 L138 100 C138 80 122 58 100 58Z" fill="#9DA4D0"/>
            <circle cx="100" cy="60" r="16" fill="white"/>
            <path d="M100 76 C82 76 70 94 70 110 L130 110 C130 94 118 76 100 76Z" fill="white"/>
          </svg>
        </div>
        <div class="brand-info" *ngIf="!collapsed()">
          <span class="brand-name">HRMS</span>
          <span class="brand-sub">Pro Suite</span>
        </div>
        <button class="hamburger" (click)="toggleCollapse()" title="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="14" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Section Label -->
      <div class="nav-section" *ngIf="!collapsed()">MAIN MENU</div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
          </div>
          <span *ngIf="!collapsed()">Dashboard</span>
        </a>
        <a routerLink="/employees" routerLinkActive="active" class="nav-item" title="Employees">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span *ngIf="!collapsed()">Employees</span>
        </a>
        <a routerLink="/salary" routerLinkActive="active" class="nav-item" title="Salary">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span *ngIf="!collapsed()">Salary</span>
        </a>
        <a routerLink="/payroll" routerLinkActive="active" class="nav-item" title="Payroll">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <span *ngIf="!collapsed()">Payroll</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="nav-section" *ngIf="!collapsed()">ACCOUNT</div>
        <button class="nav-item logout-item" (click)="logout()" title="Logout">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </div>
          <span *ngIf="!collapsed()">Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0; top: 0; z-index: 100;
      transition: width var(--transition-base);
      overflow: hidden;
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .sidebar.collapsed { width: var(--sidebar-collapsed-width); }

    .sidebar-brand {
      padding: 16px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      min-height: var(--topbar-height);
    }
    .brand-logo {
      width: 42px; height: 34px; flex-shrink: 0;
      svg { width: 42px; height: 34px; }
    }
    .brand-info { display: flex; flex-direction: column; flex: 1; }
    .brand-name {
      font-size: 18px; font-weight: 800; color: white;
      letter-spacing: 1px; line-height: 1.2;
    }
    .brand-sub {
      font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.35);
      text-transform: uppercase; letter-spacing: 2px;
    }

    .hamburger {
      width: 42px; height: 42px;
      border-radius: var(--radius-md);
      background: rgba(255,255,255,0.04);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.6);
      transition: all var(--transition-fast);
      flex-shrink: 0;
      margin-left: auto;
      svg { width: 22px; height: 22px; }
      &:hover { background: rgba(255,255,255,0.1); color: white; }
    }

    .nav-section {
      padding: 20px 22px 8px;
      font-size: 10px; font-weight: 700;
      color: rgba(255,255,255,0.2);
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 4px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 11px 14px;
      border-radius: var(--radius-md);
      color: var(--text-sidebar);
      font-size: 13px;
      font-weight: 500;
      transition: all var(--transition-fast);
      white-space: nowrap;
      text-decoration: none;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;

      .nav-icon {
        width: 38px; height: 38px;
        border-radius: var(--radius-sm);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        background: rgba(255,255,255,0.04);
        transition: all var(--transition-fast);
        svg { width: 18px; height: 18px; }
      }

      &:hover {
        color: rgba(255,255,255,0.9);
        .nav-icon { background: rgba(255,255,255,0.08); }
      }

      &.active {
        color: white;
        background: rgba(99, 91, 255, 0.2);
        .nav-icon {
          background: linear-gradient(135deg, #635BFF, #8078FF);
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.4);
          color: white;
        }
      }
    }

    .sidebar-footer {
      padding: 8px 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .logout-item:hover {
      color: #FF5252 !important;
      .nav-icon { background: rgba(255, 82, 82, 0.12) !important; }
    }

    @media (max-width: 768px) {
      .sidebar { width: var(--sidebar-collapsed-width); }
      .brand-info, .nav-item span, .nav-section { display: none; }
    }
  `]
})
export class SidebarComponent {
  collapsed = signal(false);
  @Output() collapsedChange = new EventEmitter<boolean>();
  constructor(private authService: AuthService) {}
  toggleCollapse() {
    this.collapsed.update(v => !v);
    this.collapsedChange.emit(this.collapsed());
  }
  logout() { this.authService.logout(); }
}
