---
name: react-clean-architecture
description: >-
  Standard Clean Architecture, Component Design, and Feature-Driven development guidelines for React SPA (Vite / React 19).
  Enforces clear separation between Presentation Components, Business Logic (Custom Hooks), API Services,
  Global Contexts, and Shared UI Tokens.
---

# React Clean Architecture & Clean Code Standard

This skill establishes the architectural and code quality standard for the React SPA Frontend.

---

## 🏛️ 1. Directory Structure (Feature-Driven + Shared UI)

```text
frontend/src/
├── api/                     # Centralized HTTP Client (fetch / axios wrapper)
│   ├── httpClient.js        # Base fetch/axios with token injection & 401 handling
│   └── endpoints.js         # API Endpoint URL constants
├── assets/                  # Static assets (images, logos, svg icons)
├── context/                 # Global state providers (AuthContext, ToastContext)
├── hooks/                   # Application-wide reusable Custom Hooks (useAuth, useToast, useFetch)
├── layouts/                 # Master Page Layouts (AdminLayout, TenantLayout, AuthLayout)
├── routes/                  # Routing declarations and Route Guards (ProtectedRoute, PublicRoute)
├── shared/                  # Reusable UI Design System & Utilities
│   ├── components/          # Pure UI components (Button, Input, Modal, Table, Badge, Card, Spinner)
│   └── utils/               # Formatting helpers (formatCurrencyVND, formatDateVN, validators)
├── features/                # Domain-driven feature modules
│   ├── auth/                # Login, Register, Profile, Auth helpers
│   ├── rooms/               # Room list, Room card, Room edit modal
│   ├── tenants/             # Tenant directory, Tenant details
│   ├── rentals/             # Contracts, Room rental lifecycle
│   ├── meter-readings/      # Utility recording, monthly electricity/water input
│   ├── invoices/            # Invoicing, calculations, payment tracking
│   ├── payments/            # Payment approval, payment slips
│   └── maintenance/         # Issue reporting, repair status updates
├── styles/                  # CSS Design System Tokens & Global styles
│   ├── variables.css        # Color palette, spacing, typography, shadows, border-radius
│   └── global.css           # Base reset and typography
├── App.jsx                  # Root Component with Provider hierarchy
└── main.jsx                 # Application entry point
```

---

## 📐 2. React Clean Architecture Rules

1. **Separation of Presentation & Logic**:
   - Complex components MUST extract state management and API calls into dedicated **Custom Hooks** (e.g., `useRoomList`, `useInvoiceManager`).
   - UI Components focus purely on rendering JSX and receiving props/callbacks.
2. **API Communication**:
   - Components MUST NOT call raw `fetch()` or `axios.get()` directly.
   - Always call domain-specific API functions in `src/api/*` or `features/*/api.js`.
   - `httpClient.js` automatically handles JWT Bearer headers and centralizes error toast messages.
3. **Global State**:
   - Use `AuthContext` for user session, role checks (`isLandlord`, `isTenant`), and tokens.
   - Use `ToastContext` for user-friendly success/error notifications.
4. **Route Security**:
   - `ProtectedRoute` enforces authentication and role verification before rendering protected views.
   - Unauthenticated or unauthorized users are redirected to `/admin/login` or `/tenant/login`.
5. **No Hardcoded Values**:
   - Enums and Statuses (e.g., `AVAILABLE`, `OCCUPIED`, `PAID`, `UNPAID`) must be declared as constants in `src/constants/`.
   - Format currencies using standard `formatCurrencyVND(value)` (e.g., `3.500.000 đ`).
