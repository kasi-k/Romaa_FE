# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

There is no test framework configured in this project.

## Architecture Overview

**Romaa** is a construction ERP frontend built with React 19 + Vite. It covers Tender, Projects, Purchase, Site, HR, Finance, Reports, and Settings modules.

### Tech Stack
- **Routing**: React Router v7 with lazy loading (`src/routes/AppRoutes.jsx`)
- **Server state**: TanStack Query v5 (data fetching, caching, mutations)
- **Tables**: TanStack Table v8
- **Forms**: react-hook-form + yup validation
- **Styling**: Tailwind CSS v4 + MUI (Material UI)
- **Notifications**: react-toastify (top-center, dark theme, 2s autoclose)
- **Charts**: Recharts
- **Icons**: lucide-react + react-icons (mixed usage)

### API Layer
- Single axios instance: `src/services/api.js`
- Base URL: `http://localhost:8000` (local dev); production URLs are commented out
- No auth token interceptors yet — auth is cookie-based on the backend

### Authentication & Permissions
- `src/context/AuthContext.jsx` — user stored in `localStorage` as `crm_user`
- Role-based access: `user.role.permissions[module][subModule].read/write/delete`
- `useAuth()` exposes `user`, `login`, `logout`, `canAccess(module, subModule, action)`
- `ProtectedRoute` wraps all authenticated routes

### Layout & Navigation
- `src/layout/Layout.jsx` — two-level sidebar: icon strip (main modules) + nested sub-sidebar
- Menu config lives in `src/helperConfigData/helperData.jsx` — the `Menus` array defines all nav items with `module`/`subModule` keys that match the permission keys
- Both sidebars are filtered at render time based on RBAC permissions

### Data Fetching Pattern
Each module has its own hooks file (e.g., `src/pages/tender/tenders/hooks/useTenders.js`) that wraps TanStack Query. The pattern is:
- `useXxx(queryParams)` — `useQuery` with `keepPreviousData` for paginated lists
- `useAddXxx({ onSuccess, onClose })` — `useMutation` that invalidates the list query on success
- `useEditXxx({ onSuccess, onClose })` — same pattern for updates
- Hooks call `toast.success/error` directly on mutation results

### Project/Tender Context
- `src/context/ProjectContext.jsx` — stores the active `tenderId` in `localStorage`, used when navigating into project-specific sub-pages

### Reusable Components (`src/components/`)
- `Modal` — backdrop blur overlay, accepts `title`, `child`, optional `widthClassName`
- `Filters` — search + date range filter bar
- `Table` — shared table with column definitions (`label`, `key`, optional `render`/`formatter`)
- `DeleteModal`, `Loader`, `Button`, `Dropdown`, `AccordionTable`, chart components

### File Storage
- S3 bucket: `romaafiles` — CORS must be configured in AWS for file uploads to work

### Naming Conventions
- Page files use PascalCase; folder names often use lowercase with spaces (e.g., `purchase enquiry/`)
- Module hooks are co-located inside the page folder: `src/pages/<module>/hooks/`
- Route paths are camelCase strings (e.g., `/tender/workorders`, `/hr/contractnmr`)
