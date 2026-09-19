---
name: spring-boot-clean-architecture
description: >-
  Standard Clean Architecture, SOLID, and Clean Code guidelines for Java Spring Boot applications.
  Enforces clear separation of concerns (Domain/Entity, Repository, Service/UseCases, Controller/Presentation,
  DTO, Global Exception Handling, and Security).
---

# Spring Boot Clean Architecture & Clean Code Standard

This skill establishes the architectural and code quality standard for the Java Spring Boot Backend.

---

## 🏛️ 1. Architectural Layers & Separation of Concerns

```text
com.thachbao.room_rental_management/
├── common/                  # Shared utilities, common DTOs, base exceptions
│   ├── dto/                 # ApiResponse<T>, PageResponse<T>
│   ├── exception/           # Custom exception classes & GlobalExceptionHandler
│   └── util/                # Date, string, and math helper functions
├── config/                  # Framework & infrastructure configurations (Security, OpenAPI, CORS)
├── security/                # Spring Security context, JWT Provider, Auth Filters
├── entity/                  # JPA Domain Entities (Maps 1-to-1 to Database tables)
├── enums/                   # Business domain enums (Roles, Statuses, Types)
├── repository/              # Spring Data JPA interfaces (Data Access Layer)
├── dto/                     # Data Transfer Objects (Request / Response per domain)
│   ├── auth/
│   ├── user/
│   ├── room/
│   └── ...
├── mapper/                  # Entity <-> DTO transformation mappers (Spring @Component)
├── service/                 # Business logic interfaces (Use Cases)
│   └── impl/                # Business logic implementations (@Service, @Transactional)
└── controller/              # RESTful API Presentation Layer (@RestController, @RequestMapping)
```

---

## 📐 2. Layering Rules & Constraints

1. **Controllers**:
   - MUST ONLY receive HTTP requests, validate input via `@Valid`, delegate to Services, and return `ResponseEntity<ApiResponse<T>>` or `ResponseEntity<T>`.
   - MUST NEVER contain business logic or directly call Repositories.
2. **Services**:
   - Encapsulate all business logic and transaction boundaries.
   - MUST use `@Transactional(readOnly = true)` at class level and `@Transactional` on write methods (`create`, `update`, `delete`).
   - Interact with Repositories and Mappers. Return DTOs, NOT raw entities to Controllers.
3. **Entities**:
   - Pure domain models with JPA annotations (`@Entity`, `@Table`, `@Id`, `@Column`).
   - Use Lombok `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`.
   - Never serialize entities directly to JSON; always map to Response DTOs.
4. **DTOs**:
   - Separate `*Request` (incoming payload) and `*Response` (outgoing payload).
   - Use Jakarta Validation annotations (`@NotBlank`, `@NotNull`, `@Min`, `@Pattern`, `@Size`) on Request DTOs.
5. **Exception Handling**:
   - Business errors must throw custom domain exceptions (e.g., `ResourceNotFoundException`, `BadRequestException`, `ForbiddenException`).
   - Centralized `GlobalExceptionHandler` caught via `@RestControllerAdvice` translates all exceptions into uniform `ApiResponse` with appropriate HTTP status codes.

---

## 🧼 3. Clean Code Rules

- **DRY (Don't Repeat Yourself)**: Common calculations, timezone formats, and error responses must be abstracted into utilities or common classes.
- **Explicit Naming**: Method names must be descriptive (e.g., `findActiveRentalByRoomId`, `createMonthlyInvoice`).
- **Immutable Collections**: Return unmodifiable lists or defensive copies where necessary.
- **Secure Logging**: Use SLF4J (`@Slf4j` or `LoggerFactory.getLogger`), never log passwords, tokens, or raw credentials.
