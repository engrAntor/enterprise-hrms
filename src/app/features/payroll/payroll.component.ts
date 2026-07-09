import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../core/services/payroll.service';
import { NotificationService } from '../../core/services/notification.service';
import { PayrollRecord, PayrollStatus, TaxBracket, getTaxBracket } from '../../models/payroll.model';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  records = signal<PayrollRecord[]>([]);
  filtered = signal<PayrollRecord[]>([]);
  
  showGenModal = signal(false);
  generating = signal(false);
  loadError = signal('');
  
  breakdownTarget = signal<PayrollRecord | null>(null);
  breakdownTaxBracket = signal<TaxBracket | null>(null);
  
  sumCards: any[] = [];
  paidCount = 0;
  
  currentPeriodLabel = '';
  genMonth = new Date().getMonth() + 1;
  genYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  years = [2023, 2024, 2025, 2026];
  
  filterStatus = '';
  selectedIds = new Set<string>();

  constructor(private svc: PayrollService, private notify: NotificationService) {}
  
  async ngOnInit() { 
    // Try to load period from localStorage if saved previously
    const savedPeriod = localStorage.getItem('hrms-payroll-period');
    if (savedPeriod) {
      const { m, y } = JSON.parse(savedPeriod);
      this.selectedMonth = m;
      this.selectedYear = y;
      this.genMonth = m;
      this.genYear = y;
    }
    await this.load(); 
  }

  async load() {
    try {
      this.loadError.set('');
      this.selectedIds.clear();
      
      // Save selected period
      localStorage.setItem('hrms-payroll-period', JSON.stringify({ m: this.selectedMonth, y: this.selectedYear }));
      
      const recs = await this.svc.getPayrollRecords(this.selectedMonth, this.selectedYear);
      this.records.set(recs);
      this.applyFilter();
      
      this.paidCount = recs.filter(r => r.status === PayrollStatus.Paid).length;
      
      const tG = recs.reduce((s, r) => s + r.grossSalary, 0);
      const tT = recs.reduce((s, r) => s + r.taxDeduction, 0);
      const tI = recs.reduce((s, r) => s + r.insuranceDeduction, 0);
      const tO = recs.reduce((s, r) => s + r.otherDeductions, 0);
      const tD = tT + tI + tO;
      const tN = recs.reduce((s, r) => s + r.netSalary, 0);
      
      this.currentPeriodLabel = `${this.months[this.selectedMonth - 1]} ${this.selectedYear}`;
      
      const fmt = (v: number) => v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'K' : '$' + v.toFixed(0);
      
      this.sumCards = [
        { label: 'Total Employees', value: recs.length, trend: undefined, isPercent: false, bg: '#3b82f6', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { label: 'Gross Pay', value: fmt(tG), trend: undefined, isPercent: true, bg: '#10b981', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
        { label: 'Total Deductions', value: fmt(tD), trend: undefined, isPercent: true, bg: '#a855f7', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' },
        { label: 'Net Disbursed', value: fmt(tN), trend: undefined, bg: '#f97316', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
      ];
    } catch (e: any) {
      this.loadError.set(e?.message || 'Failed to load payroll records');
      this.notify.showError(e?.message || 'Failed to load payroll records');
    }
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilter();
  }

  applyFilter() {
    this.selectedIds.clear();
    if (!this.filterStatus) {
      this.filtered.set([...this.records()]);
    } else {
      this.filtered.set(this.records().filter(r => r.status === this.filterStatus));
    }
  }

  statusCls(s: PayrollStatus) {
    const m: Record<string, string> = { Paid: 'badge-success', Approved: 'badge-info', Generated: 'badge-warning', Cancelled: 'badge-danger' };
    return m[s] || 'badge-primary';
  }

  async changeStatus(r: PayrollRecord, s: string) { 
    try {
      await this.svc.updatePayrollStatus(r.id, s as PayrollStatus); 
      this.notify.showSuccess(`Payroll for ${r.employeeName} marked as ${s}`);
      await this.load(); 
    } catch (e: any) {
      this.notify.showError(e?.message || `Failed to update status for ${r.employeeName}`);
    }
  }

  // --- Bulk Actions ---
  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAll() {
    if (this.allSelected()) {
      this.selectedIds.clear();
    } else {
      this.filtered().forEach(r => this.selectedIds.add(r.id));
    }
  }

  allSelected() {
    return this.filtered().length > 0 && this.selectedIds.size === this.filtered().length;
  }

  hasSelections() {
    return this.selectedIds.size > 0;
  }

  canBulkApprove() {
    const selected = this.filtered().filter(r => this.selectedIds.has(r.id));
    return selected.length > 0 && selected.every(r => r.status === PayrollStatus.Generated);
  }

  canBulkPay() {
    const selected = this.filtered().filter(r => this.selectedIds.has(r.id));
    return selected.length > 0 && selected.every(r => r.status === PayrollStatus.Approved);
  }

  async bulkApprove() {
    const ids = Array.from(this.selectedIds);
    let successCount = 0;
    for (const id of ids) {
      try {
        await this.svc.updatePayrollStatus(id, PayrollStatus.Approved);
        successCount++;
      } catch (e) {
        console.error('Failed to approve', id);
      }
    }
    this.notify.showSuccess(`Approved ${successCount} payroll records`);
    await this.load();
  }

  async bulkPay() {
    const ids = Array.from(this.selectedIds);
    let successCount = 0;
    for (const id of ids) {
      try {
        await this.svc.updatePayrollStatus(id, PayrollStatus.Paid);
        successCount++;
      } catch (e) {
        console.error('Failed to pay', id);
      }
    }
    this.notify.showSuccess(`Paid ${successCount} payroll records`);
    await this.load();
  }

  // --- Generation ---
  async generate() {
    // Check if period already has records
    if (this.records().length > 0 && this.genMonth === this.selectedMonth && this.genYear === this.selectedYear) {
      if (!confirm(`Records already exist for ${this.months[this.genMonth-1]} ${this.genYear}. Generating again will overwrite Draft/Generated records. Continue?`)) {
        return;
      }
    }

    this.generating.set(true);
    try {
      await this.svc.generatePayroll(this.genMonth, this.genYear);
      this.notify.showSuccess(`Payroll generated successfully for ${this.months[this.genMonth-1]} ${this.genYear}`);
      this.selectedMonth = this.genMonth;
      this.selectedYear = this.genYear;
      this.showGenModal.set(false);
      await this.load();
    } catch (e: any) {
      this.notify.showError(e?.message || 'Failed to generate payroll');
    } finally { 
      this.generating.set(false); 
    }
  }

  // --- Payslip Breakdown ---
  openBreakdown(r: PayrollRecord) {
    this.breakdownTarget.set(r);
    this.breakdownTaxBracket.set(getTaxBracket(r.grossSalary));
  }

  // --- Export ---
  exportCSV() {
    if (this.records().length === 0) {
      this.notify.showWarning('No records available to export for this period');
      return;
    }

    const headers = ['Employee', 'Department', 'Base Salary', 'Bonus', 'Overtime', 'Gross Salary', 'Tax Deduction', 'Insurance Deduction', 'Other Deductions', 'Net Salary', 'Status'];
    const rows = this.filtered().map(r => [
      `"${r.employeeName}"`,
      `"${r.department}"`,
      r.baseSalary,
      r.bonus,
      r.overtime,
      r.grossSalary,
      r.taxDeduction,
      r.insuranceDeduction,
      r.otherDeductions,
      r.netSalary,
      r.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Payroll_Export_${this.months[this.selectedMonth-1]}_${this.selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.notify.showInfo('CSV export started');
  }
}
