# 🧼 Clean Code & Development Guidelines

These rules apply across the entire Room Rental Management codebase (both Backend Java Spring Boot and Frontend React).

---

## 1. Naming Conventions

- **Java Classes**: `PascalCase` (e.g., `RoomRentalService`, `InvoiceResponse`, `JwtAuthenticationFilter`).
- **Java Methods & Variables**: `camelCase` (e.g., `calculateTotalAmount`, `depositPaidAt`, `monthlyRentPrice`).
- **Java Constants & Enum Constants**: `UPPER_SNAKE_CASE` (e.g., `ROLE_LANDLORD`, `DEFAULT_DEPOSIT_AMOUNT`).
- **React Components**: `PascalCase` (e.g., `RoomCard.jsx`, `AdminLoginPage.jsx`, `InvoiceTable.jsx`).
- **React Hooks**: `useCamelCase` (e.g., `useAuth.js`, `useFetchRooms.js`).
- **CSS Variables**: `--kebab-case` (e.g., `--primary-color`, `--shadow-md`, `--border-radius-sm`).
- **Database Tables & Columns**: `snake_case` (e.g., `room_rentals`, `is_deleted`, `password_hash`).

---

## 2. Robust Error Handling

- Never swallow exceptions with empty `catch` blocks.
- On Backend: Always throw semantic exceptions (`BadRequestException`, `ResourceNotFoundException`, `ForbiddenException`).
- On Frontend: Catch API errors in hooks/handlers and present friendly Vietnamese toast notifications.

---

## 3. Formatting & Code Readability

- Keep functions small, focused on doing one single task (Single Responsibility Principle).
- Avoid magic numbers and strings; define descriptive constants.
- Include clear Vietnamese comments/JavaDocs for complex business calculation logic (e.g., calculating electric/water consumption tiers and invoice totals).
