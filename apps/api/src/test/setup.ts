// Global test setup for the API
// Set test environment variables before any module is loaded
process.env["NODE_ENV"] = "test";
process.env["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test_db";
process.env["JWT_SECRET"] = "test-secret-key-that-is-at-least-32-characters";
process.env["PORT"] = "3001";
