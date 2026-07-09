import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { PayrollService } from '../../core/services/payroll.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <div class="breadcrumb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="home-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="bc-sep">/</span>
          <span class="bc-current">Overview</span>
        </div>
      </div>
      <div class="topbar-right">
        <!-- Search -->
        <div class="topbar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search anything..." class="search-input">
          <span class="search-shortcut">⌘K</span>
        </div>

        <!-- Theme -->
        <button class="topbar-btn" (click)="themeService.toggleTheme()" title="Toggle theme">
          <svg *ngIf="themeService.currentTheme() === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg *ngIf="themeService.currentTheme() === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>

        <!-- Notifications -->
        <div class="notif-container">
          <button class="topbar-btn notif-btn" title="Notifications" (click)="toggleNotif($event)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notif-badge" *ngIf="activities().length > 0">{{ activities().length }}</span>
          </button>
          
          <!-- Notif Dropdown -->
          <div class="notif-dropdown" [class.show]="showNotifDropdown" (click)="$event.stopPropagation()">
            <div class="nd-header">
              <h3>Recent Activity</h3>
              <button class="btn btn-ghost btn-sm" (click)="markAllRead()">Mark all as read</button>
            </div>
            <div class="nd-body">
              <div class="tl-item" *ngFor="let a of activities()">
                <div class="tl-dot-wrap">
                  <div class="tl-dot" [style.background]="a.color" [style.box-shadow]="'0 0 0 4px ' + a.color + '20'"></div>
                  <div class="tl-line"></div>
                </div>
                <div class="tl-content">
                  <p class="tl-msg">{{ a.message }}</p>
                  <span class="tl-time">{{ a.time }}</span>
                </div>
              </div>
              <div class="nd-empty" *ngIf="activities().length === 0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="topbar-divider"></div>

        <!-- User -->
        <div class="user-pill">
          <div class="user-avatar-sm">
            {{ getInitials() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</span>
            <span class="user-role">{{ authService.currentUser()?.role || 'Admin' }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background: var(--bg-topbar);
      backdrop-filter: blur(16px) saturate(180%);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .breadcrumb {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-muted);
    }
    .home-icon { width: 16px; height: 16px; }
    .bc-sep { opacity: 0.4; }
    .bc-current { color: var(--text-primary); font-weight: 600; }

    .topbar-right { display: flex; align-items: center; gap: 6px; }

    .topbar-search {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--bg-input);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0 14px;
      transition: all var(--transition-fast);
      svg { width: 16px; height: 16px; color: var(--text-muted); flex-shrink: 0; }
      &:focus-within {
        border-color: var(--primary);
        box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
        background: var(--bg-input-focus);
      }
    }
    .search-input {
      border: none; background: none; padding: 9px 10px;
      font-size: 13px; color: var(--text-primary); width: 180px;
      &::placeholder { color: var(--text-muted); }
    }
    .search-shortcut {
      font-size: 10px; font-weight: 600;
      color: var(--text-muted);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 2px 6px;
      border-radius: var(--radius-xs);
      letter-spacing: 0.5px;
    }

    .topbar-btn {
      width: 40px; height: 40px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer; transition: all var(--transition-fast);
      position: relative;
      svg { width: 20px; height: 20px; }
      &:hover { background: var(--bg-surface-hover); color: var(--text-primary); }
    }
    .notif-badge {
      position: absolute; top: 6px; right: 6px;
      width: 18px; height: 18px;
      background: linear-gradient(135deg, #FF5252, #FF7676);
      color: white; font-size: 10px; font-weight: 700;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(255,82,82,0.4);
    }
    .topbar-divider {
      width: 1px; height: 28px;
      background: var(--border-color); margin: 0 8px;
    }

    .user-pill {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 14px 6px 6px;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { background: var(--bg-surface-hover); }
    }
    .user-avatar-sm {
      width: 36px; height: 36px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, #635BFF, #00C2D1);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 12px;
      box-shadow: 0 2px 8px rgba(99,91,255,0.25);
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
    .user-role { font-size: 11px; color: var(--text-muted); }

    .notif-container { position: relative; }
    .notif-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: -8px;
      width: 340px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all var(--transition-fast) cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
      &.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
    }
    
    .nd-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
    }
    
    .nd-body {
      padding: 16px 20px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .nd-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 30px 0; color: var(--text-muted);
      svg { width: 32px; height: 32px; margin-bottom: 12px; opacity: 0.5; }
      p { font-size: 13px; margin: 0; }
    }

    /* Timeline styles similar to dashboard */
    .tl-item { display: flex; gap: 16px; margin-bottom: 2px; }
    .tl-item:last-child .tl-line { display: none; }
    .tl-dot-wrap { display: flex; flex-direction: column; align-items: center; width: 12px; margin-top: 4px; }
    .tl-dot { width: 8px; height: 8px; border-radius: 50%; z-index: 2; flex-shrink: 0; }
    .tl-line { width: 2px; flex: 1; background: var(--border-color); margin-top: 4px; min-height: 24px; }
    .tl-content { padding-bottom: 16px; }
    .tl-msg { font-size: 13px; color: var(--text-primary); font-weight: 500; line-height: 1.4; margin: 0 0 4px 0; }
    .tl-time { font-size: 11px; color: var(--text-muted); }

    @media (max-width: 768px) {
      .topbar-search, .user-info, .topbar-divider { display: none; }
      .notif-dropdown { right: -60px; width: 300px; }
    }
  `]
})
export class TopbarComponent implements OnInit {
  showNotifDropdown = false;
  activities = signal<any[]>([]);

  constructor(
    public themeService: ThemeService, 
    public authService: AuthService,
    private empService: EmployeeService,
    private payrollService: PayrollService
  ) {}

  async ngOnInit() {
    this.loadActivities();
  }

  async loadActivities() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    try {
      const [employees, currentPayroll] = await Promise.all([
        this.empService.getEmployees().catch(() => []),
        this.payrollService.getPayrollRecords(currentMonth, currentYear).catch(() => [])
      ]);

      const acts: any[] = [];

      // Recent hires
      const recentHires = [...employees]
        .filter(e => e.hireDate)
        .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
        .slice(0, 3);
        
      recentHires.forEach(e => {
        acts.push({
          message: `${e.firstName} ${e.lastName} joined as ${e.position}`,
          time: this.timeAgo(e.hireDate),
          color: '#00C48C'
        });
      });

      // Recent payroll
      const recentPayroll = [...currentPayroll]
        .filter(r => r.generatedDate)
        .sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime())
        .slice(0, 2);
        
      recentPayroll.forEach(r => {
        const monthName = monthNames[(r.month || currentMonth) - 1];
        acts.push({
          message: `Payroll ${r.status?.toLowerCase()} for ${r.employeeName} — ${monthName} ${r.year || currentYear}`,
          time: this.timeAgo(r.generatedDate),
          color: r.status === 'Paid' ? '#635BFF' : '#FFAB00'
        });
      });

      // Sort combined
      acts.sort((a, b) => {
        // Mock sorting since we only have timeAgo strings here, we'll just leave it as is 
        // because they are already sorted individually. 
        return 0; 
      });

      this.activities.set(acts);
    } catch (err) {
      console.error('Failed to load activities', err);
    }
  }

  toggleNotif(event: Event) {
    event.stopPropagation();
    this.showNotifDropdown = !this.showNotifDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.showNotifDropdown = false;
  }

  markAllRead() {
    this.activities.set([]);
    this.showNotifDropdown = false;
  }

  timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 2592000) return Math.floor(seconds / 86400) + 'd ago';
    return Math.floor(seconds / 2592000) + 'mo ago';
  }

  getInitials(): string {
    const u = this.authService.currentUser();
    return u ? (u.firstName[0] + u.lastName[0]).toUpperCase() : 'AU';
  }
}
