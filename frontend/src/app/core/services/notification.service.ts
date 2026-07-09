import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  showSuccess(message: string, title = 'Success') {
    this.add({ type: 'success', message, title });
  }

  showError(message: string, title = 'Error') {
    this.add({ type: 'error', message, title });
  }

  showWarning(message: string, title = 'Warning') {
    this.add({ type: 'warning', message, title });
  }

  showInfo(message: string, title = 'Info') {
    this.add({ type: 'info', message, title });
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(toast: Omit<Toast, 'id'>) {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, ...toast }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
