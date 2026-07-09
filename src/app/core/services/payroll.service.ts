import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PayrollRecord, PayrollStatus, PayrollSummary } from '../../models/payroll.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private apiUrl = `${environment.apiBaseUrl}/PayrollRecords`;

  constructor(private http: HttpClient) {}

  async getPayrollRecords(month?: number, year?: number): Promise<PayrollRecord[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.apiUrl, { params }));
      return res.map(r => this.mapFromServer(r));
    } catch (err: any) {
      throw this.extractError(err);
    }
  }

  async getPayrollById(id: string): Promise<PayrollRecord> {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
      return this.mapFromServer(res);
    } catch (err: any) {
      throw this.extractError(err);
    }
  }

  async createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<PayrollRecord> {
    const payload = this.sanitize(record);
    try {
      return await firstValueFrom(this.http.post<PayrollRecord>(this.apiUrl, payload));
    } catch (err: any) {
      throw this.extractError(err);
    }
  }

  async updatePayrollRecord(id: string, data: Partial<PayrollRecord>): Promise<PayrollRecord> {
    const payload = this.sanitize(data);
    try {
      return await firstValueFrom(this.http.put<PayrollRecord>(`${this.apiUrl}/${id}`, payload));
    } catch (err: any) {
      throw this.extractError(err);
    }
  }

  async deletePayrollRecord(id: string): Promise<void> {
    try {
      return await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    } catch (err: any) {
      throw this.extractError(err);
    }
  }

  async generatePayroll(month: number, year: number): Promise<PayrollRecord[]> {
    try {
      const res = await firstValueFrom(
        this.http.post<any[]>(`${this.apiUrl}/generate`, { month, year })
      );
      return res.map(r => this.mapFromServer(r));
    } catch (err: any) {
      throw this.extractError(err);
    }
  }

  async getPayrollSummary(month: number, year: number): Promise<PayrollSummary> {
    let params = new HttpParams().set('month', month.toString()).set('year', year.toString());
    try {
      return await firstValueFrom(this.http.get<PayrollSummary>(`${this.apiUrl}/summary`, { params }));
    } catch (err: any) {
      throw this.extractError(err);
    }
  }

  async updatePayrollStatus(id: string, status: PayrollStatus): Promise<PayrollRecord> {
    const record = await this.getPayrollById(id);
    return this.updatePayrollRecord(id, { ...record, status });
  }

  async cancelPayroll(id: string): Promise<PayrollRecord> {
    return this.updatePayrollStatus(id, PayrollStatus.Cancelled);
  }

  private sanitize(obj: any): any {
    const dateFields = ['generatedDate', 'paidDate'];
    const result = { ...obj };
    
    for (const key of dateFields) {
      if (key in result && (result[key] === '' || result[key] === undefined)) {
        result[key] = null;
      }
    }

    // Map string enum to backend integer enum
    // C#: public enum PayrollStatus { Draft, Generated, Approved, Paid, Cancelled }
    if (result.status === 'Draft') result.status = 0;
    else if (result.status === 'Generated') result.status = 1;
    else if (result.status === 'Approved') result.status = 2;
    else if (result.status === 'Paid') result.status = 3;
    else if (result.status === 'Cancelled') result.status = 4;

    // Remove properties that might not exist on the backend entity
    delete result.employeeName;
    delete result.department;
    
    return result;
  }

  private mapFromServer(r: any): PayrollRecord {
    const statuses = ['Draft', 'Generated', 'Approved', 'Paid', 'Cancelled'];
    const statusStr = typeof r.status === 'number' ? statuses[r.status] : (r.status || 'Draft');
    
    const empName = r.employee ? `${r.employee.firstName || ''} ${r.employee.lastName || ''}`.trim() : 'Unknown';
    const dept = r.employee?.department?.toString() || 'Unknown';
    
    const depts = ['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Legal'];
    const finalDept = typeof r.employee?.department === 'number' ? depts[r.employee.department] : dept;

    return {
      ...r,
      employeeName: empName,
      department: finalDept,
      status: statusStr
    } as PayrollRecord;
  }

  extractError(err: any): Error {
    const e = err?.error;
    if (!e) return new Error(`Request failed (${err?.status ?? 'unknown'})`);
    if (typeof e === 'string') return new Error(e);
    if (e.errors) {
      const msgs = Object.entries(e.errors)
        .map(([f, v]) => `${f}: ${(v as string[]).join(', ')}`)
        .join(' | ');
      return new Error(msgs || e.title || 'Validation failed');
    }
    if (e.title) return new Error(e.title);
    if (e.message) return new Error(e.message);
    return new Error(JSON.stringify(e));
  }
}
