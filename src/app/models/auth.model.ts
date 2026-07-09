export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export enum UserRole {
  Admin = 'Admin',
  HRManager = 'HR Manager',
  Employee = 'Employee'
}
