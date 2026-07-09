import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Employee, EmployeeFilter } from '../../models/employee.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = `${environment.apiBaseUrl}/Employees`;

  constructor(private http: HttpClient) {}

  async getEmployees(filter?: EmployeeFilter): Promise<Employee[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
      if (filter.department) params = params.set('department', filter.department);
      if (filter.status) params = params.set('status', filter.status);
    }
    return firstValueFrom(this.http.get<Employee[]>(this.apiUrl, { params }));
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    return firstValueFrom(this.http.get<Employee>(`${this.apiUrl}/${id}`));
  }

  async addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const payload = this.sanitize(employee);
    console.log('[EmployeeService] POST payload:', JSON.stringify(payload, null, 2));
    try {
      return await firstValueFrom(this.http.post<Employee>(this.apiUrl, payload));
    } catch (err: any) {
      console.error('[EmployeeService] POST error body:', err?.error);
      throw this.extractError(err);
    }
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const payload = this.sanitize(data);
    console.log('[EmployeeService] PUT payload:', JSON.stringify(payload, null, 2));
    try {
      return await firstValueFrom(this.http.put<Employee>(`${this.apiUrl}/${id}`, payload));
    } catch (err: any) {
      console.error('[EmployeeService] PUT error body:', err?.error);
      throw this.extractError(err);
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  /** Replace empty strings with null for date/optional fields so .NET doesn't reject them */
  private sanitize(obj: any): any {
    const dateFields = ['dateOfBirth', 'hireDate', 'paidDate', 'lastRevisionDate', 'effectiveDate'];
    const optionalStrings = ['address', 'avatarUrl', 'emergencyContact', 'emergencyPhone', 'phone', 'accountNumber'];
    const result = { ...obj };
    for (const key of dateFields) {
      if (key in result && (result[key] === '' || result[key] === null)) {
        result[key] = null;
      }
    }
    for (const key of optionalStrings) {
      if (key in result && result[key] === '') {
        result[key] = null;
      }
    }
    return result;
  }

  /** Extract a human-readable message from a .NET HttpErrorResponse */
  private extractError(err: any): Error {
    // 409 Conflict → duplicate email
    if (err?.status === 409) {
      const msg = err?.error?.message || err?.error?.title || 'Email already exists. Please use a different email address.';
      const e = new Error(msg);
      (e as any).status = 409;
      return e;
    }
    const e = err?.error;
    if (!e) return new Error('Request failed');
    if (typeof e === 'string') return new Error(e);
    // .NET ValidationProblemDetails format: { errors: { Field: ["msg"] } }
    if (e.errors) {
      const msgs = Object.entries(e.errors)
        .map(([field, errs]) => `${field}: ${(errs as string[]).join(', ')}`)
        .join(' | ');
      return new Error(msgs || e.title || 'Validation failed');
    }
    if (e.title) return new Error(e.title);
    if (e.message) return new Error(e.message);
    return new Error(JSON.stringify(e));
  }
}
