import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let t of svc.toasts(); trackBy: trackById"
        class="toast"
        [ngClass]="'toast-' + t.type"
        (click)="svc.dismiss(t.id)">
        <div class="toast-icon">
          <!-- success -->
          <svg *ngIf="t.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <!-- error -->
          <svg *ngIf="t.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <!-- warning -->
          <svg *ngIf="t.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <!-- info -->
          <svg *ngIf="t.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ t.title }}</div>
          <div class="toast-msg">{{ t.message }}</div>
        </div>
        <button class="toast-close" (click)="svc.dismiss(t.id); $event.stopPropagation()">✕</button>
        <div class="toast-progress"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 10px;
      z-index: 9999;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      min-width: 300px; max-width: 400px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      pointer-events: all;
      position: relative;
      overflow: hidden;
      animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
      backdrop-filter: blur(10px);
      border: 1px solid transparent;
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(40px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    .toast-success {
      background: rgba(0, 196, 140, 0.95);
      border-color: rgba(0, 196, 140, 0.3);
      color: white;
    }
    .toast-error {
      background: rgba(255, 82, 82, 0.95);
      border-color: rgba(255, 82, 82, 0.3);
      color: white;
    }
    .toast-warning {
      background: rgba(255, 171, 0, 0.95);
      border-color: rgba(255, 171, 0, 0.3);
      color: white;
    }
    .toast-info {
      background: rgba(68, 138, 255, 0.95);
      border-color: rgba(68, 138, 255, 0.3);
      color: white;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 22px; height: 22px;
      svg { width: 22px; height: 22px; }
    }

    .toast-content { flex: 1; }
    .toast-title { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
    .toast-msg { font-size: 12px; opacity: 0.9; line-height: 1.4; }

    .toast-close {
      background: none; border: none; color: inherit; opacity: 0.7;
      font-size: 13px; cursor: pointer; padding: 0;
      flex-shrink: 0; margin-top: -2px;
      &:hover { opacity: 1; }
    }

    .toast-progress {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: rgba(255,255,255,0.4);
      animation: progress 4s linear forwards;
      transform-origin: left;
    }

    @keyframes progress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `]
})
export class ToastComponent {
  constructor(public svc: NotificationService) {}
  trackById(_: number, t: Toast) { return t.id; }
}
