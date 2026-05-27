# Tasks — AB-1002 Authentication

## Database Setup

- [x] Create User Prisma model
- [x] Create RefreshToken Prisma model
- [x] Add database indexes
- [x] Generate Prisma migration
- [x] Generate Prisma client

---

## Shared Schemas

- [x] Create register request schema
- [x] Create login request schema
- [x] Create auth response schema
- [x] Export shared auth types

---

## Backend Module Setup

- [x] Create auth module structure
- [x] Create auth controller
- [x] Create auth service
- [x] Create auth repository
- [x] Create auth routes

---

## JWT Implementation

- [x] Implement access token generator
- [x] Implement refresh token generator
- [x] Implement JWT verification utility
- [x] Configure token expiry handling

---

## Registration

- [x] Implement register endpoint
- [x] Validate duplicate email handling
- [x] Hash passwords before persistence

---

## Login

- [x] Implement login endpoint
- [x] Validate credentials
- [x] Generate access token
- [x] Generate refresh token
- [x] Persist refresh token

---

## Refresh Flow

- [x] Implement refresh endpoint
- [x] Validate refresh token
- [x] Rotate refresh token
- [x] Revoke old refresh token

---

## Logout

- [x] Implement logout endpoint
- [x] Revoke refresh token
- [x] Handle invalid logout attempts

---

## Authorization

- [x] Implement JWT auth middleware
- [x] Protect authenticated routes
- [x] Implement current user endpoint

---

## Testing

- [x] Add register endpoint tests
- [x] Add login endpoint tests
- [x] Add refresh endpoint tests
- [x] Add logout endpoint tests
- [x] Add auth middleware tests

---

## Validation

- [x] Verify pnpm build
- [x] Verify lint passes
- [x] Verify tests pass
- [x] Verify coverage requirements
- [x] Run openspec validate
