# HRMS Frontend — Angular + TypeScript Implementation Plan

## Overview

Build a fully-featured, production-ready Angular 17+ frontend for a Human Resource Management System (HRMS). The UI will be extraordinary — dark-themed, glassmorphism-style with smooth animations, premium typography, and a fully responsive layout. The frontend will use mock/stub services so the backend can be connected later via environment config.

---

## Architecture

```
src/
├── app/
│   ├── core/                    # Guards, interceptors, services (auth, api base)
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/                  # Reusable components, pipes, directives
│   │   ├── components/
│   │   └── pipes/
│   ├── layout/                  # App shell: sidebar, topbar, footer
│   ├── features/
│   │   ├── auth/                # Login page
│   │   ├── dashboard/           # Overview cards, charts
│   │   ├── employees/           # CRUD, search, filter
│   │   ├── salary/              # Salary management
│   │   └── payroll/             # Payroll generation, reports
│   ├── models/                  # TypeScript interfaces/enums
│   └── environments/            # API base URL config
```

---

## Modules & Features

### 1. Auth Module
- Login page with animated gradient background
- JWT token stored in localStorage (ready for backend)
- Auth guard on all protected routes

### 2. Dashboard Module
- KPI cards (total employees, payroll cost, pending requests)
- Animated bar/line chart (Chart.js or ng2-charts)
- Recent activity feed
- Quick action buttons

### 3. Employee Management Module
- Paginated data table with search + filter (by dept, status)
- Add / Edit employee modal form
- Employee detail view
- Status badges (Active, Inactive, On Leave)
- Avatar generation

### 4. Salary Management Module
- Salary records table
- Set/update salary form
- Deductions & bonuses breakdown
- Salary revision history

### 5. Payroll Module
- Generate payroll (month/year selector)
- Payroll summary table
- Tax & deduction breakdown
- Export to PDF button (UI only, wired later)

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#6C63FF` (Electric Violet) |
| Accent | `#00D4FF` (Cyan) |
| Success | `#00C896` |
| Warning | `#FFB800` |
| Danger | `#FF4D6D` |
| Background | `#0D0E1A` |
| Surface | `rgba(255,255,255,0.04)` |
| Font | Inter (Google Fonts) |

- Glassmorphism cards with `backdrop-filter: blur`
- Smooth route transitions with Angular animations
- Hover micro-animations on all interactive elements
- Responsive sidebar (collapsible on mobile)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 17 (standalone components) |
| Language | TypeScript |
| Styling | SCSS with CSS custom properties |
| Charts | Chart.js via ng2-charts |
| Icons | Lucide Angular / Material Icons |
| HTTP | Angular HttpClient (with mock interceptor) |
| State | Angular Signals + Services |
| Routing | Angular Router with lazy loading |
| Forms | Reactive Forms with validation |

---

## Mock Data Strategy

- `MockApiInterceptor` intercepts HTTP calls and returns stub data
- Controlled via `environment.useMockApi = true`
- When backend is ready: set `useMockApi = false` and update `apiBaseUrl`

---

## Proposed Changes

### [NEW] Angular 17 Project scaffold at `e:/HRMS_Project/`

All source files will be created fresh.

---

## Verification Plan

### Automated
- `ng build` — verify zero compilation errors
- `ng serve` — verify app runs locally

### Manual
- Navigate all routes, verify lazy loading works
- Test employee CRUD flows
- Verify responsive layout on mobile/tablet
- Confirm charts render correctly
