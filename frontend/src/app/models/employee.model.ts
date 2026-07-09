export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hireDate: string;
  position: string;
  department: Department;
  accountNumber: string;
  status: EmployeeStatus;
  avatarUrl?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export enum Department {
  HR = 'Human Resources',
  IT = 'Information Technology',
  Finance = 'Finance',
  Marketing = 'Marketing',
  Operations = 'Operations',
  Sales = 'Sales',
  Engineering = 'Engineering',
  Legal = 'Legal'
}

export enum EmployeeStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  OnLeave = 'On Leave',
  Terminated = 'Terminated'
}

export interface EmployeeFilter {
  searchTerm?: string;
  department?: Department | '';
  status?: EmployeeStatus | '';
}
