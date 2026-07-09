import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { MetadataService, MetadataOption } from '../../core/services/metadata.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="emp-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Employee Management</h1>
          <p class="page-subtitle">{{ filteredEmployees().length }} employees found</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Employee
        </button>
      </div>

      <!-- Filters -->
      <div class="card filter-card">
        <div class="card-body filters-row">
          <div class="search-box filter-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="form-input" placeholder="Search employees..." [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()">
          </div>
          <select class="form-select filter-select" [(ngModel)]="filterDept" (ngModelChange)="applyFilters()">
            <option value="">All Departments</option>
            <option *ngFor="let d of departments" [value]="d.value">{{ d.label }}</option>
          </select>
          <select class="form-select filter-select" [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
            <option value="">All Statuses</option>
            <option *ngFor="let s of statuses" [value]="s.value">{{ s.label }}</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Status</th>
                <th>Hire Date</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of paginatedEmployees(); let i = index" class="row-anim" [style.animation-delay]="i * 40 + 'ms'">
                <td>
                  <div class="emp-info">
                    <div class="avatar" [style.background]="avatarColor(emp.id)">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                    <div>
                      <div class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</div>
                      <div class="emp-email">{{ emp.email }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="position-text">{{ emp.position }}</span></td>
                <td><span class="badge badge-primary">{{ shortDept(emp.department) }}</span></td>
                <td>
                  <span class="badge" [ngClass]="statusBadge(emp.status)">
                    <span class="dot"></span> {{ emp.status }}
                  </span>
                </td>
                <td>{{ formatDate(emp.hireDate) }}</td>
                <td>
                  <div class="row-actions">
                    <button class="act-btn" (click)="viewEmployee(emp)" title="View">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="act-btn" (click)="openEditModal(emp)" title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="act-btn act-danger" (click)="deleteEmployee(emp)" title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="table-footer" *ngIf="filteredEmployees().length > 0">
          <span class="footer-info">Showing {{ startIdx + 1 }}–{{ endIdx }} of {{ filteredEmployees().length }} employees</span>
          <div class="pagination">
            <button class="pagination-btn" (click)="prevPage()" [disabled]="currentPage === 1">&laquo;</button>
            <button *ngFor="let p of totalPagesArray()" class="pagination-btn" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            <button class="pagination-btn" (click)="nextPage()" [disabled]="currentPage >= totalPages()">&raquo;</button>
          </div>
        </div>
      </div>

      <!-- View Modal -->
      <div class="modal-overlay" *ngIf="viewingEmployee()" (click)="viewingEmployee.set(null)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Employee Profile</h2>
            <button class="btn btn-ghost btn-icon" (click)="viewingEmployee.set(null)">✕</button>
          </div>
          <div class="modal-body" *ngIf="viewingEmployee() as e">
            <div class="profile-hero">
              <div class="avatar avatar-lg" [style.background]="avatarColor(e.id)">{{ e.firstName[0] }}{{ e.lastName[0] }}</div>
              <div>
                <h3 class="profile-name">{{ e.firstName }} {{ e.lastName }}</h3>
                <p class="profile-pos">{{ e.position }}</p>
                <span class="badge" [ngClass]="statusBadge(e.status)">{{ e.status }}</span>
              </div>
            </div>
            <div class="profile-grid">
              <div class="pg-item"><label>Email</label><span>{{ e.email }}</span></div>
              <div class="pg-item"><label>Phone</label><span>{{ e.phone }}</span></div>
              <div class="pg-item"><label>Department</label><span>{{ e.department }}</span></div>
              <div class="pg-item"><label>Account #</label><span>{{ e.accountNumber }}</span></div>
              <div class="pg-item"><label>Birth Date</label><span>{{ e.dateOfBirth }}</span></div>
              <div class="pg-item"><label>Hire Date</label><span>{{ e.hireDate }}</span></div>
              <div class="pg-item pg-full"><label>Address</label><span>{{ e.address || 'N/A' }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" *ngIf="showFormModal()" (click)="showFormModal.set(false)">
        <div class="modal-container modal-wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingEmployee() ? 'Edit Employee' : 'New Employee' }}</h2>
            <button class="btn btn-ghost btn-icon" (click)="showFormModal.set(false)">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">First Name *</label><input class="form-input" [(ngModel)]="form.firstName" placeholder="John"></div>
              <div class="form-group"><label class="form-label">Last Name *</label><input class="form-input" [(ngModel)]="form.lastName" placeholder="Doe"></div>
              <div class="form-group"><label class="form-label">Email *</label><input class="form-input" [class.input-error]="emailConflict()" type="email" [(ngModel)]="form.email" placeholder="john@company.com" (ngModelChange)="emailConflict.set(false)"><span *ngIf="emailConflict()" class="field-error">Email already exists. Use a different address.</span></div>
              <div class="form-group"><label class="form-label">Phone</label><input class="form-input" [(ngModel)]="form.phone" placeholder="+1 (555) 123-4567"></div>
              <div class="form-group"><label class="form-label">Position *</label><input class="form-input" [(ngModel)]="form.position" placeholder="Software Engineer"></div>
              <div class="form-group"><label class="form-label">Department *</label>
                <select class="form-select" [(ngModel)]="form.department"><option value="">Select</option><option *ngFor="let d of departments" [value]="d.value">{{ d.label }}</option></select>
              </div>
              <div class="form-group"><label class="form-label">Date of Birth</label><input class="form-input" type="date" [(ngModel)]="form.dateOfBirth"></div>
              <div class="form-group"><label class="form-label">Hire Date</label><input class="form-input" type="date" [(ngModel)]="form.hireDate"></div>
              <div class="form-group"><label class="form-label">Account #</label><input class="form-input" [(ngModel)]="form.accountNumber" placeholder="ACC-001234"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-select" [(ngModel)]="form.status"><option *ngFor="let s of statuses" [value]="s.value">{{ s.label }}</option></select>
              </div>
              <div class="form-group pg-full"><label class="form-label">Address</label><input class="form-input" [(ngModel)]="form.address" placeholder="Street, City, State"></div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="form-err" *ngIf="formError()">{{ formError() }}</div>
            <button class="btn btn-secondary" (click)="showFormModal.set(false)">Cancel</button>
            <button class="btn btn-primary" (click)="saveEmployee()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (editingEmployee() ? 'Update' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .emp-page > * { animation: fadeIn 0.4s ease both; }
    .filter-card { margin-bottom: 20px; }
    .filters-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .filter-search { flex: 1; min-width: 220px; }
    .filter-select { width: 180px; }

    .table-scroll { overflow-x: auto; }
    .emp-info { display: flex; align-items: center; gap: 14px; }
    .emp-name { font-weight: 700; font-size: 13px; color: var(--text-primary); }
    .emp-email { font-size: 12px; color: var(--text-muted); }
    .position-text { font-weight: 500; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block; }
    .row-anim { animation: fadeIn 0.35s ease both; }
    .row-actions { display: flex; gap: 4px; justify-content: flex-end; }
    .act-btn {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      background: transparent; color: var(--text-muted); cursor: pointer;
      transition: all var(--transition-fast); border: none;
      svg { width: 15px; height: 15px; }
      &:hover { background: var(--bg-surface-hover); color: var(--text-primary); }
    }
    .act-danger:hover { color: var(--danger) !important; background: var(--danger-bg) !important; }

    .table-footer {
      padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
      border-top: 1px solid var(--border-light);
    }
    .footer-info { font-size: 13px; color: var(--text-muted); font-weight: 500; }

    .profile-hero { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
    .profile-name { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
    .profile-pos { font-size: 14px; color: var(--text-secondary); margin-bottom: 6px; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .pg-item {
      label { display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
      span { font-size: 14px; color: var(--text-primary); font-weight: 500; }
    }
    .pg-full { grid-column: span 2; }
    .modal-wide { max-width: 720px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    @media (max-width: 768px) {
      .filters-row { flex-direction: column; }
      .filter-select { width: 100%; }
      .profile-grid, .form-grid { grid-template-columns: 1fr; }
      .pg-full { grid-column: span 1; }
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .field-error { display: block; font-size: 11px; color: var(--danger); margin-top: 4px; font-weight: 600; }
    .input-error { border-color: var(--danger) !important; box-shadow: 0 0 0 3px rgba(239,68,68,.15) !important; }
    .form-err { flex: 1; font-size: 13px; color: var(--danger); font-weight: 600; padding: 4px 0; }
  `]
})
export class EmployeesComponent implements OnInit {
  allEmployees = signal<Employee[]>([]);
  filteredEmployees = signal<Employee[]>([]);
  paginatedEmployees = signal<Employee[]>([]);
  viewingEmployee = signal<Employee | null>(null);
  editingEmployee = signal<Employee | null>(null);
  showFormModal = signal(false);
  saving = signal(false);

  searchTerm = ''; filterDept = ''; filterStatus = '';
  currentPage = 1; pageSize = 8; startIdx = 0; endIdx = 0;
  departments: MetadataOption[] = [];
  statuses: MetadataOption[] = [];
  loadError = signal('');
  formError = signal('');
  emailConflict = signal(false);
  form: any = this.emptyForm();

  private colors = ['linear-gradient(135deg,#635BFF,#8078FF)','linear-gradient(135deg,#00C2D1,#33D4E0)','linear-gradient(135deg,#00C48C,#00E6A0)','linear-gradient(135deg,#FFAB00,#FFD54F)','linear-gradient(135deg,#FF5252,#FF7676)','linear-gradient(135deg,#8B5CF6,#A78BFA)','linear-gradient(135deg,#EC4899,#F472B6)','linear-gradient(135deg,#448AFF,#82B1FF)'];

  constructor(private empService: EmployeeService, private metadata: MetadataService) {}

  async ngOnInit() {
    try {
      const [depts, statuses] = await Promise.all([
        this.metadata.getDepartments(),
        this.metadata.getEmployeeStatuses()
      ]);
      this.departments = depts;
      this.statuses = statuses;
    } catch {
      // fallback with space-stripped values for C# enum compatibility
      this.departments = [
        'Human Resources','Information Technology','Finance',
        'Marketing','Operations','Sales','Engineering','Legal'
      ].map(l => ({ label: l, value: l.replace(/\s+/g, '') }));
      this.statuses = ['Active','Inactive','OnLeave','Terminated']
        .map(v => ({ label: v.replace(/([A-Z])/g, ' $1').trim(), value: v }));
    }
    await this.load();
  }

  async load() {
    try {
      this.loadError.set('');
      this.allEmployees.set(await this.empService.getEmployees());
      this.applyFilters();
    } catch (e: any) {
      this.loadError.set(e?.message || 'Failed to load employees');
    }
  }

  applyFilters() {
    let r = [...this.allEmployees()];
    if (this.searchTerm) { const t = this.searchTerm.toLowerCase(); r = r.filter(e => `${e.firstName} ${e.lastName} ${e.email} ${e.position}`.toLowerCase().includes(t)); }
    if (this.filterDept) r = r.filter(e => e.department === this.filterDept);
    if (this.filterStatus) r = r.filter(e => e.status === this.filterStatus);
    this.filteredEmployees.set(r);
    this.currentPage = 1;
    this.paginate();
  }

  paginate() {
    const s = (this.currentPage - 1) * this.pageSize;
    this.startIdx = s;
    this.endIdx = Math.min(s + this.pageSize, this.filteredEmployees().length);
    this.paginatedEmployees.set(this.filteredEmployees().slice(s, this.endIdx));
  }

  totalPages() { return Math.ceil(this.filteredEmployees().length / this.pageSize) || 1; }
  totalPagesArray() { return Array.from({ length: this.totalPages() }, (_, i) => i + 1); }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.paginate(); } }
  nextPage() { if (this.currentPage < this.totalPages()) { this.currentPage++; this.paginate(); } }
  goToPage(p: number) { this.currentPage = p; this.paginate(); }

  avatarColor(id: string) { const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0); return this.colors[hash % this.colors.length]; }
  shortDept(d: string) { return d.length > 14 ? d.split(' ').map(w => w[0]).join('') : d; }
  formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  statusBadge(s: string) { return s === 'Active' ? 'badge-success' : s === 'On Leave' ? 'badge-warning' : 'badge-danger'; }

  viewEmployee(e: Employee) { this.viewingEmployee.set(e); }
  openAddModal() { this.editingEmployee.set(null); this.form = this.emptyForm(); this.showFormModal.set(true); }
  openEditModal(e: Employee) { this.editingEmployee.set(e); this.form = { ...e }; this.showFormModal.set(true); }

  async saveEmployee() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.position || !this.form.department) return;
    this.saving.set(true);
    this.formError.set('');
    this.emailConflict.set(false);
    try {
      if (this.editingEmployee()) await this.empService.updateEmployee(this.editingEmployee()!.id, this.form);
      else await this.empService.addEmployee(this.form);
      await this.load();
      this.showFormModal.set(false);
    } catch (err: any) {
      if ((err as any)?.status === 409) {
        this.emailConflict.set(true);
        this.formError.set(''); // field-level hint is enough
      } else {
        this.formError.set(err?.message || 'Failed to save employee. Please try again.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  async deleteEmployee(e: Employee) {
    if (confirm(`Delete ${e.firstName} ${e.lastName}?`)) { await this.empService.deleteEmployee(e.id); await this.load(); }
  }

  private emptyForm() { return { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', hireDate: new Date().toISOString().split('T')[0], position: '', department: '', accountNumber: '', status: 'Active', address: '' }; }
}
