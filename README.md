# 🏢 Enterprise HRMS Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/engrAntor/enterprise-hrms)
[![Angular](https://img.shields.io/badge/Angular-17.3-DD0031.svg?style=for-the-badge&logo=angular)](https://angular.io)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4.svg?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A modern, full-stack Human Resource Management System (HRMS) built to streamline employee management, salary processing, and automated payroll operations. Featuring a beautiful, responsive Angular 17 frontend and a robust, clean-architecture .NET 9 API backend.

---

## ✨ Features

- **🛡️ Secure Authentication**: JWT-based login and session management with role-based access control (RBAC).
- **👥 Employee Management**: Comprehensive employee profiles, onboarding, and directory search.
- **💰 Salary Tracking**: Dynamic tracking of employee compensation, bonuses, and historical salary revisions.
- **💸 Automated Payroll**: One-click generation of monthly payrolls with accurate real-time data calculations.
- **📊 Executive Dashboard**: Beautifully designed overview of workforce metrics, total payroll expenditures, and recent activities.
- **🎨 Modern UI/UX**: A state-of-the-art interface utilizing dynamic themes, glassmorphism, and responsive layouts.

## 💻 Tech Stack

### Frontend (Client-side)
- **Framework**: Angular 17 (TypeScript)
- **Styling**: SCSS / Modern CSS (Flexbox, CSS Grid)
- **State Management**: RxJS
- **Routing**: Angular Router

### Backend (Server-side)
- **Framework**: .NET 9.0 (C#)
- **Architecture**: Clean Architecture Pattern (Api, Application, Domain, Infrastructure)
- **Database**: Entity Framework Core 9 (Code-First)
- **Authentication**: JWT Bearer Tokens
- **Logging**: Serilog
- **Documentation**: Swagger / OpenAPI

## 📂 Project Structure

```bash
enterprise-hrms/
├── frontend/               # Angular 17 Web Application
│   ├── src/
│   │   ├── app/            # Core modules, services, and components
│   │   ├── assets/         # Static assets and images
│   │   └── environments/   # Environment configurations
│   └── package.json
└── backend/                # .NET 9 API Solution
    ├── HRMS.Api/           # API Controllers and Program Entry
    ├── HRMS.Application/   # Business Logic, Commands/Queries
    ├── HRMS.Domain/        # Core Entities and Enums
    └── HRMS.Infrastructure/# EF Core DBContext and Data Access
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- SQL Server (or LocalDB)

### 1. Backend Setup (.NET 9 API)
1. Navigate to the API project:
   ```bash
   cd backend/src/HRMS.Api
   ```
2. Restore dependencies and update the database:
   ```bash
   dotnet restore
   dotnet ef database update --project ../HRMS.Infrastructure
   ```
3. Run the API:
   ```bash
   dotnet run
   ```
   > **Note:** You can view the API documentation by navigating to `/swagger` in your browser.

### 2. Frontend Setup (Angular 17)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:4200/`.

## 🔒 Authentication Flow
The system utilizes JWT for stateless authentication.
1. Users authenticate via the `/api/auth/login` endpoint on the `.NET` backend.
2. The Angular frontend intercepts successful logins, storing the JWT securely.
3. An `HttpInterceptor` automatically attaches the `Bearer` token to all subsequent API requests.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check the issues page.

## 📝 License
This project is [MIT](LICENSE) licensed.

---

