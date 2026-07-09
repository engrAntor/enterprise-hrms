export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  overtime: number;
  taxDeduction: number;
  insuranceDeduction: number;
  otherDeductions: number;
  grossSalary: number;
  netSalary: number;
  status: PayrollStatus;
  generatedDate: string;
  paidDate?: string;
}

export enum PayrollStatus {
  Draft = 'Draft',
  Generated = 'Generated',
  Approved = 'Approved',
  Paid = 'Paid',
  Cancelled = 'Cancelled'
}

export interface PayrollSummary {
  month: number;
  year: number;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalTax: number;
  status: PayrollStatus;
}

export interface PayrollComponent {
  label: string;
  amount: number;
  percentage?: number;
  type: 'earning' | 'deduction' | 'tax';
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  label: string;
}

export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0,       max: 12000,  rate: 0.00, label: '0%' },
  { min: 12001,   max: 49999,  rate: 0.12, label: '12%' },
  { min: 50000,   max: 99999,  rate: 0.22, label: '22%' },
  { min: 100000,  max: Infinity, rate: 0.24, label: '24%' }
];

export const INSURANCE_RATE = 0.05; // 5% of gross

export function computeTax(grossSalary: number): number {
  for (const bracket of TAX_BRACKETS) {
    if (grossSalary >= bracket.min && grossSalary <= bracket.max) {
      return Math.round(grossSalary * bracket.rate);
    }
  }
  return 0;
}

export function getTaxBracket(grossSalary: number): TaxBracket {
  return TAX_BRACKETS.find(b => grossSalary >= b.min && grossSalary <= b.max)
    ?? TAX_BRACKETS[TAX_BRACKETS.length - 1];
}

export interface PayrollReport {
  period: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalGross: number;
  totalTax: number;
  totalInsurance: number;
  totalOtherDeductions: number;
  totalNet: number;
  paidCount: number;
  pendingCount: number;
}

export interface PayrollExportRow {
  employee: string;
  department: string;
  baseSalary: number;
  bonus: number;
  overtime: number;
  grossSalary: number;
  taxDeduction: number;
  insuranceDeduction: number;
  otherDeductions: number;
  netSalary: number;
  status: string;
}
