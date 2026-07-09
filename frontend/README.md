# HRMS Platform Frontend

A modern, enterprise-ready Human Resource Management System (HRMS) built with Angular 17 and designed to integrate seamlessly with a .NET backend API.

## 🚀 Features

- **Dynamic Dashboard**: Real-time insights and metrics.
- **Employee Management**: View, add, and manage employee profiles and details.
- **Salary Administration**: Manage salary components, structures, and employee compensations.
- **Payroll Processing**: Automated payroll generation, tracking, and management.
- **Modern UI/UX**: Built with responsive design principles, custom SCSS themes, and a clean layout system.

## 🛠 Tech Stack

- **Framework**: Angular 17 (Standalone Components)
- **Styling**: SCSS, Custom Design System
- **HTTP**: RxJS, Angular HttpClient with Token Interceptors
- **Icons**: Phosphor Icons (or preferred icon pack)

## 🏃‍♂️ Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

3. **Backend Integration**:
   Ensure the .NET backend API is running. Check `src/environments/environment.ts` to verify the `apiBaseUrl` points to your active backend instance.

## 📦 Build for Production

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## 📄 License

This project is licensed under the MIT License.
