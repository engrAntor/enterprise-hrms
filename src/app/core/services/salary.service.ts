import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SalaryRecord, SalaryRevision } from '../../models/salary.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private apiUrl = `${environment.apiBaseUrl}/SalaryRecords`;

  constructor(private http: HttpClient) {}

  async getSalaryRecords(): Promise<SalaryRecord[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      return res.map(r => this.mapFromServer(r));
    } catch (err: any) {
      console.error('[SalaryService] GET error:', err?.error);
      throw this.extractError(err);
    }
  }

  async getSalaryById(id: string): Promise<SalaryRecord> {
    const res = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
    return this.mapFromServer(res);
  }

  async addSalaryRecord(record: Omit<SalaryRecord, 'id'>): Promise<SalaryRecord> {
    const payload = this.sanitize(record);
    console.log('[SalaryService] POST payload:', JSON.stringify(payload, null, 2));
    try {
      return await firstValueFrom(this.http.post<SalaryRecord>(this.apiUrl, payload));
    } catch (err: any) {
      console.error('[SalaryService] POST error:', err?.error);
      throw this.extractError(err);
    }
  }

  async updateSalary(id: string, data: Partial<SalaryRecord>): Promise<SalaryRecord> {
    const current = await this.getSalaryById(id);
    const payload = this.sanitize({ ...current, ...data });
    console.log('[SalaryService] PUT payload:', JSON.stringify(payload, null, 2));
    try {
      return await firstValueFrom(this.http.put<SalaryRecord>(`${this.apiUrl}/${id}`, payload));
    } catch (err: any) {
      console.error('[SalaryService] PUT error:', err?.error);
      throw this.extractError(err);
    }
  }

  async deleteSalaryRecord(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  async getRevisions(salaryRecordId: string): Promise<SalaryRevision[]> {
    return firstValueFrom(this.http.get<SalaryRevision[]>(`${this.apiUrl}/${salaryRecordId}/revisions`));
  }

  private sanitize(obj: any): any {
    const dateFields = ['effectiveDate', 'lastRevisionDate', 'createdAt'];
    const result = { ...obj };
    
    for (const key of dateFields) {
      if (key in result && (result[key] === '' || result[key] === undefined)) {
        result[key] = null;
      }
    }

    // Map string enum to backend integer enum
    // C#: public enum SalaryStatus { Current = 0, Pending = 1, Revised = 2 }
    if (result.status === 'Current') result.status = 0;
    else if (result.status === 'Pending') result.status = 1;
    else if (result.status === 'Revised') result.status = 2;

    // Remove properties that don't exist on the backend SalaryRecord entity
    delete result.employeeName;
    delete result.department;
    delete result.netSalary;
    
    return result;
  }

  private mapFromServer(r: any): SalaryRecord {
    const statuses = ['Current', 'Pending', 'Revised'];
    const statusStr = typeof r.status === 'number' ? statuses[r.status] : (r.status || 'Current');
    
    // Some endpoints might return employee object, some might not. We handle safely.
    const empName = r.employee ? `${r.employee.firstName || ''} ${r.employee.lastName || ''}`.trim() : 'Unknown';
    const dept = r.employee?.department?.toString() || 'Unknown';
    
    // Department enum mapping if it returns a number
    const depts = ['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Legal'];
    const finalDept = typeof r.employee?.department === 'number' ? depts[r.employee.department] : dept;

    return {
      ...r,
      employeeName: empName,
      department: finalDept,
      netSalary: (r.baseSalary || 0) + (r.bonus || 0) - (r.deductions || 0),
      status: statusStr
    } as SalaryRecord;
  }

  private extractError(err: any): Error {
    const e = err?.error;
    if (!e) return new Error(`Request failed (${err?.status})`);
    if (typeof e === 'string') return new Error(e);
    if (e.errors) {
      const msgs = Object.entries(e.errors)
        .map(([f, v]) => `${f}: ${(v as string[]).join(', ')}`)
        .join(' | ');
      return new Error(msgs || e.title || 'Validation failed');
    }
    if (e.title)   return new Error(e.title);
    if (e.message) return new Error(e.message);
    return new Error(JSON.stringify(e));
  }
}
