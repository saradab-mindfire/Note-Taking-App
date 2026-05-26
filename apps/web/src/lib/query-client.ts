// TanStack Query configuration
// The QueryClient instance is created in main.tsx
// This file exports query key factories and utilities

export const queryKeys = {
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
  },
} as const;
