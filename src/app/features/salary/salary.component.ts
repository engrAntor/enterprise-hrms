import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaryService } from '../../core/services/salary.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { SalaryRecord, SalaryRevision, SalaryStatus, SalaryBonusItem, SalaryDeductionItem, SalaryValidationErrors } from '../../models/salary.model';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit {
  records = signal<SalaryRecord[]>([]);
  filtered = signal<SalaryRecord[]>([]);
  editing = signal<SalaryRecord | null>(null);
  showModal = signal(false);
  showRevisions = signal(false);
  deleteTarget = signal<SalaryRecord | null>(null);
  loadError = signal('');
  saving = signal(false);

  searchTerm = '';
  filterDept = '';
  filterStatus = '';
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';

  departments: string[] = [];
  employees: Employee[] = [];
  revisions: SalaryRevision[] = [];
  revisionEmployee = '';
  summaryCards: any[] = [];
  netPreview = 0;

  editForm = this.getEmptyForm();
  formErrors: SalaryValidationErrors = {};

  constructor(
    private svc: SalaryService,
    private empSvc: EmployeeService,
    private notify: NotificationService
  ) {}

  async ngOnInit() {
    await this.load();
    try {
      this.employees = await this.empSvc.getEmployees();
    } catch { /* employees list unavailable */ }
  }

  async load() {
    try {
      this.loadError.set('');
      const recs = await this.svc.getSalaryRecords();
      this.records.set(recs);
      this.departments = [...new Set(recs.map(r => r.department))].sort();
      this.applyFilters();
      this.buildSummary(recs);
    } catch (e: any) {
      this.loadError.set(e?.message || 'Failed to load salary records');
    }
  }

  applyFilters() {
    let result = [...this.records()];
    const t = this.searchTerm.toLowerCase();
    if (t) result = result.filter(r => r.employeeName.toLowerCase().includes(t) || r.department.toLowerCase().includes(t));
    if (this.filterDept) result = result.filter(r => r.department === this.filterDept);
    if (this.filterStatus) result = result.filter(r => r.status === this.filterStatus);
    if (this.sortField) {
      result.sort((a: any, b: any) => {
        const va = a[this.sortField], vb = b[this.sortField];
        const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    this.filtered.set(result);
  }

  sortBy(field: string) {
    if (this.sortField === field) { this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; }
    else { this.sortField = field; this.sortDir = 'asc'; }
    this.applyFilters();
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return '⇅';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  badgeFor(s: SalaryStatus) {
    return s === SalaryStatus.Current ? 'badge-success' : s === SalaryStatus.Pending ? 'badge-warning' : 'badge-info';
  }

  openAdd() {
    this.editing.set(null);
    this.editForm = this.getEmptyForm();
    this.formErrors = {};
    this.recalcNet();
    this.showModal.set(true);
  }

  openEdit(r: SalaryRecord) {
    this.editing.set(r);
    this.editForm = {
      employeeId: r.employeeId,
      baseSalary: r.baseSalary,
      effectiveDate: r.effectiveDate?.split('T')[0] || '',
      status: r.status,
      bonusItems: r.bonus > 0 ? [{ label: 'Bonus', amount: r.bonus }] : [],
      deductionItems: r.deductions > 0 ? [{ label: 'Deductions', amount: r.deductions }] : []
    };
    this.formErrors = {};
    this.recalcNet();
    this.showModal.set(true);
  }

  addBonusItem() { this.editForm.bonusItems.push({ label: '', amount: 0 }); }
  removeBonusItem(i: number) { this.editForm.bonusItems.splice(i, 1); this.recalcNet(); }
  addDeductionItem() { this.editForm.deductionItems.push({ label: '', amount: 0 }); }
  removeDeductionItem(i: number) { this.editForm.deductionItems.splice(i, 1); this.recalcNet(); }

  recalcNet() {
    const base = this.editForm.baseSalary || 0;
    const bonus = this.editForm.bonusItems.reduce((s, b) => s + (b.amount || 0), 0);
    const ded = this.editForm.deductionItems.reduce((s, d) => s + (d.amount || 0), 0);
    this.netPreview = base + bonus - ded;
  }

  validate(): boolean {
    this.formErrors = {};
    if (!this.editing() && !this.editForm.employeeId) this.formErrors.employeeId = 'Please select an employee';
    if (!this.editForm.baseSalary || this.editForm.baseSalary <= 0) this.formErrors.baseSalary = 'Base salary must be greater than 0';
    if (!this.editForm.effectiveDate) this.formErrors.effectiveDate = 'Effective date is required';
    return !this.formErrors.employeeId && !this.formErrors.baseSalary && !this.formErrors.effectiveDate;
  }

  async save() {
    if (!this.validate()) return;
    this.saving.set(true);
    try {
      const bonus = this.editForm.bonusItems.reduce((s, b) => s + (b.amount || 0), 0);
      const deductions = this.editForm.deductionItems.reduce((s, d) => s + (d.amount || 0), 0);
      const payload: any = {
        baseSalary: this.editForm.baseSalary,
        bonus,
        deductions,
        netSalary: this.netPreview,
        effectiveDate: this.editForm.effectiveDate,
        status: this.editForm.status
      };
      if (this.editing()) {
        await this.svc.updateSalary(this.editing()!.id, payload);
        this.notify.showSuccess('Salary record updated successfully');
      } else {
        const emp = this.employees.find(e => e.id === this.editForm.employeeId);
        payload.employeeId = this.editForm.employeeId;
        payload.employeeName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
        payload.department = emp?.department || 'Unknown';
        await this.svc.addSalaryRecord(payload);
        this.notify.showSuccess('Salary record created successfully');
      }
      this.showModal.set(false);
      await this.load();
    } catch (e: any) {
      this.formErrors.general = e?.message || 'Failed to save';
      this.notify.showError(e?.message || 'Failed to save salary record');
    } finally {
      this.saving.set(false);
    }
  }

  async openRevisions(r: SalaryRecord) {
    this.revisionEmployee = r.employeeName;
    try {
      this.revisions = await this.svc.getRevisions(r.id);
    } catch {
      this.revisions = [];
    }
    this.showRevisions.set(true);
  }

  getChangePercent(rev: SalaryRevision): string {
    if (!rev.previousSalary) return 'New';
    const pct = ((rev.newSalary - rev.previousSalary) / rev.previousSalary * 100).toFixed(1);
    return (rev.newSalary >= rev.previousSalary ? '+' : '') + pct + '%';
  }

  confirmDelete(r: SalaryRecord) { this.deleteTarget.set(r); }

  async doDelete() {
    const r = this.deleteTarget();
    if (!r) return;
    try {
      await this.svc.deleteSalaryRecord(r.id);
      this.notify.showSuccess(`Salary record for ${r.employeeName} deleted`);
      this.deleteTarget.set(null);
      await this.load();
    } catch (e: any) {
      this.notify.showError(e?.message || 'Failed to delete');
    }
  }

  private buildSummary(recs: SalaryRecord[]) {
    const tBase = recs.reduce((s, r) => s + r.baseSalary, 0);
    const tBonus = recs.reduce((s, r) => s + r.bonus, 0);
    const tDed = recs.reduce((s, r) => s + r.deductions, 0);
    const tNet = recs.reduce((s, r) => s + r.netSalary, 0);
    const fmt = (v: number) => v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'K' : '$' + v;
    this.summaryCards = [
      { label: 'Total Base', value: fmt(tBase), trend: undefined, isPercent: false, bg: '#3b82f6', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { label: 'Total Bonuses', value: fmt(tBonus), trend: undefined, isPercent: true, bg: '#10b981', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
      { label: 'Total Deductions', value: fmt(tDed), trend: undefined, isPercent: true, bg: '#a855f7', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' },
      { label: 'Total Net Pay', value: fmt(tNet), trend: undefined, bg: '#f97316', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
    ];
  }

  private getEmptyForm() {
    return {
      employeeId: '',
      baseSalary: 0,
      effectiveDate: new Date().toISOString().split('T')[0],
      status: SalaryStatus.Current as SalaryStatus,
      bonusItems: [] as SalaryBonusItem[],
      deductionItems: [] as SalaryDeductionItem[]
    };
  }
}
