export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalPayroll: number;
  pendingRequests: number;
  newHiresThisMonth: number;
  departmentDistribution: DepartmentStat[];
  monthlyPayrollTrend: MonthlyPayroll[];
  recentActivities: Activity[];
}

export interface DepartmentStat {
  department: string;
  count: number;
  percentage: number;
}

export interface MonthlyPayroll {
  month: string;
  amount: number;
}

export interface Activity {
  id: number;
  type: 'hire' | 'salary_update' | 'payroll' | 'leave' | 'termination';
  message: string;
  timestamp: string;
  icon: string;
}
