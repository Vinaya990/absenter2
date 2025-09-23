# Absentra - Leave Management System

## Project Overview
Absentra is a comprehensive leave management system built with React 18, TypeScript, and Tailwind CSS. The application provides role-based access control for managing employee leave requests, department management, and approval workflows.

## Current State (September 23, 2025)
✅ **Development Environment Setup Complete**
- Vite development server configured and running on port 5000
- Frontend properly configured for Replit environment (0.0.0.0 host)
- TypeScript compilation working without errors
- All dependencies installed and working

✅ **Deployment Configuration**
- Configured for autoscale deployment
- Build command: `npm run build`
- Run command: `npm run preview`

## Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v7.9.0
- **Build Tool**: Vite 5.4.2
- **Icons**: Lucide React
- **State Management**: React Context (AuthContext, DataContext, NotificationContext)
- **Data Storage**: Currently using localStorage with mock data
- **Export Features**: PDF (jsPDF), Excel (XLSX)

## Project Architecture
```
src/
├── components/
│   ├── admin/          # Admin-specific components (user management, reports)
│   ├── auth/           # Authentication components (login, register, protected routes)
│   ├── dashboards/     # Role-based dashboard components
│   ├── features/       # Core features (leave management, calendar, profile)
│   ├── layout/         # Layout components (header, sidebar)
│   ├── ui/             # Reusable UI components
│   └── widgets/        # Dashboard widgets
├── contexts/           # React context providers
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Default Login Credentials
- **Admin**: `admin` / `password`
- **HR Manager**: `hr.manager` / `password`
- **Line Manager**: `line.manager` / `password`
- **Employee**: `employee` / `password`

## Development Workflow
- **Start Development**: Workflow "Start application" runs `npm run dev`
- **Port**: 5000 (configured for Replit webview)
- **Hot Reload**: Enabled via Vite

## Key Features Implemented
- Multi-role authentication system
- Department and employee management
- Leave request creation and approval workflows
- Holiday calendar management
- Reporting and analytics
- PDF and Excel export functionality
- Responsive design with dark/light theme support

## Notes
- Application currently uses mock data stored in localStorage
- Supabase SDK is included in dependencies but not actively used
- All authentication and data management is handled client-side
- Ready for backend integration when needed

## Recent Changes
- Fixed React import in App.tsx (removed unused import)
- Configured Vite for Replit environment (host: 0.0.0.0, port: 5000)
- Set up proper deployment configuration
- Verified all TypeScript compilation works without errors