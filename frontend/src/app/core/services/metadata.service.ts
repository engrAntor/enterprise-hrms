import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MetadataOption {
  label: string;   // display text in dropdown, e.g. "Human Resources"
  value: string;   // value sent to backend, e.g. "HumanResources" or "0"
}

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getDepartments(): Promise<MetadataOption[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/Metadata/departments`).pipe(
        map(items => {
          console.log('[MetadataService] raw departments:', JSON.stringify(items, null, 2));
          return this.toOptions(items);
        })
      )
    );
  }

  getEmployeeStatuses(): Promise<MetadataOption[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/Metadata/employee-statuses`).pipe(
        map(items => {
          console.log('[MetadataService] raw statuses:', JSON.stringify(items, null, 2));
          return this.toOptions(items);
        })
      )
    );
  }

  private toOptions(items: any[]): MetadataOption[] {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      if (typeof item === 'string') return { label: item, value: item };
      if (typeof item === 'number') return { label: String(item), value: String(item) };
      // Backend returns { key: "HR", value: "Human Resources" }
      // key = C# enum member name sent to backend
      // value = human-readable display label
      const label: string = item.value ?? item.name ?? item.label ?? String(item);
      const value: string = item.key   !== undefined ? String(item.key) :
                            item.value !== undefined ? String(item.value).replace(/\s+/g, '') :
                            label.replace(/\s+/g, '');
      return { label, value };
    });
  }
}
