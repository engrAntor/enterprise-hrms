import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { PayrollService } from '../../core/services/payroll.service';
import { EmployeeStatus } from '../../models/employee.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Here's what's happening with your organization today</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            May 2024
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="card card-hover stat-card" *ngFor="let s of stats(); let i = index" [style.animation-delay]="i * 80 + 'ms'">
          <div class="card-body">
            <div class="stat-top">
              <div class="stat-icon" [style.background]="s.bg">
                <span [innerHTML]="s.icon"></span>
              </div>
              <div *ngIf="s.trend !== undefined" class="stat-change positive">
                {{ s.trend > 0 ? '+' : '' }}{{ s.trend }}{{ s.isPercent ? '%' : '' }}
              </div>
            </div>
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <!-- Department Chart -->
        <div class="card">
          <div class="card-header">
            <h3>Department Distribution</h3>
            <span class="badge badge-primary">{{ deptData().length }} Departments</span>
          </div>
          <div class="card-body">
            <div class="dept-list">
              <div class="dept-row" *ngFor="let d of deptData(); let i = index" [style.animation-delay]="i * 60 + 'ms'">
                <div class="dept-left">
                  <div class="dept-dot" [style.background]="d.color"></div>
                  <span class="dept-name">{{ d.name }}</span>
                </div>
                <div class="dept-right">
                  <div class="dept-bar-bg">
                    <div class="dept-bar-fill" [style.width.%]="d.pct" [style.background]="d.color"></div>
                  </div>
                  <span class="dept-count">{{ d.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payroll Chart -->
        <div class="card">
          <div class="card-header">
            <h3>Monthly Payroll Trend</h3>
            <span class="badge badge-info">{{ currentYear }}</span>
          </div>
          <div class="card-body">
            <div class="bar-chart">
              <div class="bar-col" *ngFor="let b of payrollBars(); let i = index" [style.animation-delay]="i * 40 + 'ms'">
                <div class="bar-value">{{ b.val > 0 ? '$' + b.val + 'K' : '—' }}</div>
                <div class="bar-track">
                  <div class="bar-fill" [style.height.%]="b.pct" [class.bar-highlight]="b.highlight"></div>
                </div>
                <span class="bar-month">{{ b.month }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="bottom-grid">
        <!-- Activity -->
        <div class="card">
          <div class="card-header">
            <h3>Recent Activity</h3>
            <button class="btn btn-ghost btn-sm">View All</button>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div class="tl-item" *ngFor="let a of activities(); let i = index" [style.animation-delay]="i * 80 + 'ms'">
                <div class="tl-dot-wrap">
                  <div class="tl-dot" [style.background]="a.color" [style.box-shadow]="'0 0 0 4px ' + a.color + '20'"></div>
                  <div class="tl-line" *ngIf="i < activities().length - 1"></div>
                </div>
                <div class="tl-content">
                  <p class="tl-msg">{{ a.message }}</p>
                  <span class="tl-time">{{ a.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header"><h3>Quick Actions</h3></div>
          <div class="card-body">
            <div class="actions-grid">
              <a routerLink="/employees" class="qa-card">
                <div class="qa-icon" style="background: linear-gradient(135deg, #635BFF, #8078FF)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                <div class="qa-text">
                  <span class="qa-title">Add Employee</span>
                  <span class="qa-desc">Create new record</span>
                </div>
                <svg class="qa-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/salary" class="qa-card">
                <div class="qa-icon" style="background: linear-gradient(135deg, #00C48C, #00E6A0)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div class="qa-text">
                  <span class="qa-title">Manage Salary</span>
                  <span class="qa-desc">Update compensations</span>
                </div>
                <svg class="qa-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
              <a routerLink="/payroll" class="qa-card">
                <div class="qa-icon" style="background: linear-gradient(135deg, #FFAB00, #FFD54F)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div class="qa-text">
                  <span class="qa-title">Run Payroll</span>
                  <span class="qa-desc">Generate monthly</span>
                </div>
                <svg class="qa-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard > * { animation: fadeIn 0.5s ease both; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .stat-card { animation: fadeIn 0.5s ease both; }

    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .dept-list { display: flex; flex-direction: column; gap: 14px; }
    .dept-row {
      display: flex; align-items: center; justify-content: space-between;
      animation: slideInLeft 0.4s ease both;
    }
    .dept-left { display: flex; align-items: center; gap: 10px; min-width: 120px; }
    .dept-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dept-name { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
    .dept-right { display: flex; align-items: center; gap: 12px; flex: 1; }
    .dept-bar-bg { flex: 1; height: 8px; background: var(--bg-surface-hover); border-radius: var(--radius-full); overflow: hidden; }
    .dept-bar-fill { height: 100%; border-radius: var(--radius-full); transition: width 1s cubic-bezier(0.4,0,0.2,1); }
    .dept-count { font-size: 13px; font-weight: 700; color: var(--text-primary); width: 24px; text-align: right; }

    .bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 220px; padding-top: 10px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; animation: fadeIn 0.5s ease both; }
    .bar-value { font-size: 10px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
    .bar-fill {
      width: 65%; max-width: 32px;
      background: linear-gradient(to top, var(--primary), var(--primary-light));
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      transition: height 0.8s cubic-bezier(0.4,0,0.2,1);
      min-height: 4px;
      &.bar-highlight {
        background: linear-gradient(to top, #00C2D1, #33D4E0);
        box-shadow: 0 0 12px rgba(0,194,209,0.3);
      }
    }
    .bar-month { margin-top: 8px; font-size: 10px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.3px; }

    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .timeline { display: flex; flex-direction: column; }
    .tl-item {
      display: flex; gap: 14px; animation: fadeIn 0.4s ease both;
    }
    .tl-dot-wrap { display: flex; flex-direction: column; align-items: center; }
    .tl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .tl-line { width: 2px; flex: 1; background: var(--border-light); margin: 4px 0; min-height: 24px; }
    .tl-content { padding-bottom: 20px; }
    .tl-msg { font-size: 13px; color: var(--text-primary); font-weight: 500; line-height: 1.4; }
    .tl-time { font-size: 12px; color: var(--text-muted); }

    .actions-grid { display: flex; flex-direction: column; gap: 10px; }
    .qa-card {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; border-radius: var(--radius-md);
      background: var(--bg-surface-hover);
      transition: all var(--transition-fast);
      text-decoration: none;
      &:hover { transform: translateX(4px); box-shadow: var(--shadow-sm); background: var(--bg-surface); }
    }
    .qa-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { width: 20px; height: 20px; } }
    .qa-text { flex: 1; display: flex; flex-direction: column; }
    .qa-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .qa-desc { font-size: 12px; color: var(--text-muted); }
    .qa-arrow { width: 16px; height: 16px; color: var(--text-muted); }
    .header-actions { display: flex; gap: 10px; }

    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
      .charts-grid, .bottom-grid { grid-template-columns: 1fr; }
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<any[]>([]);
  deptData = signal<any[]>([]);
  payrollBars = signal<any[]>([]);
  activities = signal<any[]>([]);
  currentYear = new Date().getFullYear();

  constructor(private empService: EmployeeService, private payrollService: PayrollService) { }

  async ngOnInit() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fetch employees + current month payroll in parallel
    const [employees, currentPayroll] = await Promise.all([
      this.empService.getEmployees().catch(() => []),
      this.payrollService.getPayrollRecords(currentMonth, currentYear).catch(() => [])
    ]);

    // --- Stat Cards ---
    const active = employees.filter(e => e.status === EmployeeStatus.Active).length;
    const totalNet = currentPayroll.reduce((s, r) => s + r.netSalary, 0);
    
    let totalPayroll = '$0';
    if (totalNet > 0) {
      if (totalNet >= 1000000) {
        totalPayroll = '$' + (totalNet / 1000000).toFixed(1) + 'M';
      } else if (totalNet >= 1000) {
        totalPayroll = '$' + (totalNet / 1000).toFixed(1) + 'K';
      } else {
        totalPayroll = '$' + totalNet.toLocaleString();
      }
    }
    
    const avgSalary = '$' + (totalNet > 0 && active > 0 ? Math.round(totalNet / active).toLocaleString() : '0');
    const pendingCount = 0; // Replace with actual logic when API supports it

    this.stats.set([
      { label: 'Total Employees', value: employees.length, trend: undefined, isPercent: false, bg: '#3b82f6', icon: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { label: 'Total Payroll', value: totalPayroll, trend: undefined, isPercent: true, bg: '#10b981', icon: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
      { label: 'Avg Salary', value: avgSalary, trend: undefined, isPercent: true, bg: '#a855f7', icon: '<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' },
      { label: 'Pending Approvals', value: pendingCount, trend: undefined, isPercent: false, bg: '#f97316', icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
    ]);

    // --- Department Distribution ---
    const deptMap = new Map<string, number>();
    employees.forEach(e => { const d = e.department as string; deptMap.set(d, (deptMap.get(d) || 0) + 1); });
    const colors = ['#635BFF', '#00C2D1', '#00C48C', '#FFAB00', '#FF5252', '#448AFF', '#8B5CF6', '#EC4899'];
    let i = 0;
    const maxCount = deptMap.size > 0 ? Math.max(...deptMap.values()) : 1;
    const depts: any[] = [];
    deptMap.forEach((count, name) => {
      depts.push({ name: name.length > 16 ? name.split(' ')[0] : name, count, pct: (count / maxCount) * 100, color: colors[i % colors.length] });
      i++;
    });
    this.deptData.set(depts);

    // --- Monthly Payroll Trend (fetch all records for current year in one request to prevent concurrent request failures) ---
    let yearlyRecords: any[] = [];
    try {
      yearlyRecords = await this.payrollService.getPayrollRecords(undefined, currentYear);
    } catch {
      yearlyRecords = [];
    }

    const monthlyData = monthNames.map((_, idx) => {
      const monthRecs = yearlyRecords.filter(r => r.month === idx + 1);
      const net = monthRecs.reduce((s, r) => s + (r.netSalary || 0), 0);
      return { month: idx + 1, net };
    });
    const maxNet = Math.max(...monthlyData.map(m => m.net), 1);
    this.payrollBars.set(
      monthlyData.map(m => ({
        month: monthNames[m.month - 1],
        val: m.net > 0 ? parseFloat((m.net / 1000).toFixed(1)) : 0,
        pct: m.net > 0 ? Math.round((m.net / maxNet) * 100) : 0,
        highlight: m.month === currentMonth
      }))
    );

    // --- Recent Activity from real data ---
    const acts: any[] = [];

    // Recent hires (last 5 sorted by hire date desc)
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

    // Recent payroll records (generated)
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

    // Sort all activities by recency and cap at 5
    this.activities.set(
      acts.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 5)
    );
  }

  private timeAgo(dateStr: string): string {
    if (!dateStr) return 'recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
