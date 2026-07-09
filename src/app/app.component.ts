import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { ToastComponent } from './layout/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <ng-container *ngIf="isLoginPage; else appShell">
      <router-outlet></router-outlet>
    </ng-container>

    <ng-template #appShell>
      <div class="app-layout">
        <app-sidebar (collapsedChange)="onSidebarToggle($event)"></app-sidebar>
        <div class="main-area" [class.sidebar-collapsed]="sidebarCollapsed">
          <app-topbar></app-topbar>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </ng-template>
    <app-toast></app-toast>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-body);
    }
    .main-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left var(--transition-base);
    }
    .main-area.sidebar-collapsed {
      margin-left: var(--sidebar-collapsed-width);
    }
    .main-content {
      flex: 1;
      padding: 28px 32px;
      overflow-y: auto;
    }
    @media (max-width: 768px) {
      .main-area { margin-left: var(--sidebar-collapsed-width); }
      .main-content { padding: 16px; }
    }
  `]
})
export class AppComponent {
  isLoginPage = false;
  sidebarCollapsed = false;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.urlAfterRedirects?.includes('/login');
      });
  }

  onSidebarToggle(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }
}
