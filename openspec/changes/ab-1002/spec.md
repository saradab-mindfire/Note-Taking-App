# Feature Goal

Implement authentication APIs for user registration, login, logout, token refresh, and authenticated user access using JWT access tokens and refresh tokens.

# Scope

Included:

- User registration
- User login
- JWT access token generation
- Refresh token generation and persistence
- Logout endpoint
- Auth middleware
- Token refresh endpoint

Excluded:

- Forgot password
- OTP reset
- OAuth/social login

# APIs

POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET /auth/me

# Database Schema Changes

Add User table fields:

- id
- email
- passwordHash
- createdAt

Add RefreshToken table:

- id
- userId
- tokenHash
- expiresAt
- revokedAt
- createdAt

# Validation Rules

Registration:

- email must be valid
- password minimum length 8

Login:

- valid email required
- password required

Refresh:

- refresh token required

# Error Cases

- duplicate email registration
- invalid credentials
- expired refresh token
- revoked refresh token
- unauthorized access
- malformed JWT

# Security Constraints

- Passwords must be hashed using bcrypt
- JWT secret stored in environment variables
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Refresh tokens stored in database
- Logout revokes refresh token
- Protected routes require JWT validation

# Acceptance Criteria

- Users can register successfully
- Users can login successfully
- Access tokens are generated
- Refresh tokens are persisted
- Logout revokes refresh tokens
- Expired tokens are rejected
- Protected endpoints require valid JWT
- All auth tests pass
