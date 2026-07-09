import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginRequest, LoginResponse, UserProfile } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'hrms-token';
  private readonly USER_KEY = 'hrms-user';

  currentUser = signal<UserProfile | null>(this.getStoredUser());
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private router: Router, private http: HttpClient) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiBaseUrl}/Auth/login`, credentials)
      );
      this.setSession(response);
      return response;
    } catch (error: any) {
      console.error('Login failed', error);
      const msg = error?.error?.message || error?.error || 'Invalid credentials';
      throw new Error(typeof msg === 'string' ? msg : 'Login failed');
    }
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiBaseUrl}/Auth/register`, data)
      );
      this.setSession(response);
      return response;
    } catch (error: any) {
      console.error('Register failed', error);
      const msg = error?.error?.message || error?.error || 'Registration failed';
      throw new Error(typeof msg === 'string' ? msg : 'Registration failed');
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private getStoredUser(): UserProfile | null {
    const json = localStorage.getItem(this.USER_KEY);
    if (json) {
      try {
        return JSON.parse(json);
      } catch {
        return null;
      }
    }
    return null;
  }
}
