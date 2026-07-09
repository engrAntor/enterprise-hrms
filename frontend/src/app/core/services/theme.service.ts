import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'hrms-theme';
  currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
    // Apply immediately
    document.documentElement.setAttribute('data-theme', this.currentTheme());
  }

  toggleTheme(): void {
    this.currentTheme.update(t => t === 'light' ? 'dark' : 'light');
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    return stored ?? 'light';
  }
}
