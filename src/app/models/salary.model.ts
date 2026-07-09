export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  effectiveDate: string;
  lastRevisionDate?: string;
  status: SalaryStatus;
}

export enum SalaryStatus {
  Current = 'Current',
  Revised = 'Revised',
  Pending = 'Pending'
}

export interface SalaryRevision {
  id: string;
  salaryRecordId: string;
  previousSalary: number;
  newSalary: number;
  reason: string;
  effectiveDate: string;
  approvedBy: string;
  createdAt: string;
}

export interface SalaryBreakdown {
  label: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface SalaryBonusItem {
  label: string;
  amount: number;
}

export interface SalaryDeductionItem {
  label: string;
  amount: number;
}

export interface SalaryRevisionRequest {
  previousSalary: number;
  newSalary: number;
  reason: string;
  effectiveDate: string;
  approvedBy: string;
}

export interface SalaryFormData {
  employeeId: string;
  baseSalary: number;
  bonusItems: SalaryBonusItem[];
  deductionItems: SalaryDeductionItem[];
  effectiveDate: string;
  status: SalaryStatus;
}

export interface SalaryValidationErrors {
  baseSalary?: string;
  effectiveDate?: string;
  employeeId?: string;
  general?: string;
}
