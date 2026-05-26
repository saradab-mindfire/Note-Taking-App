# CLAUDE.md — Notepad Monorepo

This file configures Claude Code for the `notepad-monorepo` project.

---

## Project Overview

A full-stack note-taking application built as a pnpm monorepo.

| Package           | Technology                          | Purpose              |
| ----------------- | ----------------------------------- | -------------------- |
| `apps/web`        | React 19 + Vite + TypeScript        | Frontend SPA         |
| `apps/api`        | Express 5 + Node.js 22 + TypeScript | REST API backend     |
| `packages/shared` | TypeScript + Zod                    | Shared schemas/types |
| `packages/ui`     | React + shadcn/ui + Tailwind        | UI component library |

---

## Architecture Principles

- **Shared first**: All Zod schemas and TypeScript types live in `packages/shared`. Never duplicate them in `apps/`.
- **Strict TypeScript**: `strict: true` everywhere. No `any`. No type assertions unless unavoidable.
- **Environment validation**: Backend uses Zod-parsed `env.ts` — never access `process.env` directly outside that file.
- **Error handling**: Backend uses the centralized `AppError` class and `errorHandler` middleware.
- **No secrets in code**: Sensitive values live in `.env` only. The `.env.example` shows the schema.

---

## Common Commands

```bash
# Install all dependencies
pnpm install

# Start development (all apps)
pnpm dev

# Start only frontend
pnpm --filter @notepad/web dev

# Start only backend
pnpm --filter @notepad/api dev

# Run all tests
pnpm test

# Run lint
pnpm lint

# Run type checks
pnpm typecheck

# Format all files
pnpm format

# Build all packages
pnpm build

# Database
pnpm --filter @notepad/api db:migrate
pnpm --filter @notepad/api db:generate
pnpm --filter @notepad/api db:studio
```

---

## Project Structure

```
notepad-monorepo/
├── apps/
│   ├── web/                  # React frontend
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── lib/          # Utilities & query config
│   │   │   ├── store/        # Zustand stores
│   │   │   └── test/         # Test setup
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   └── api/                  # Express backend
│       └── src/
│           ├── index.ts      # Entry point
│           ├── app.ts        # Express app factory
│           ├── config/       # Environment config (env.ts)
│           ├── middleware/   # error-handler, validate, not-found
│           ├── routes/       # API route definitions
│           └── lib/          # prisma.ts client
├── packages/
│   ├── shared/               # Shared schemas & types
│   │   └── src/
│   │       ├── schemas/      # Zod schemas
│   │       └── types/        # TypeScript types
│   └── ui/                   # shadcn/ui component library
│       └── src/
│           ├── components/   # UI components
│           └── lib/utils.ts  # cn() helper
├── prisma/
│   └── schema.prisma         # Prisma schema (PostgreSQL)
├── openspec/                 # OpenSpec workflow
│   └── changes/              # Change artifacts (spec, plan, tasks)
├── .husky/                   # Git hooks
├── tsconfig.base.json        # Shared TS config
├── pnpm-workspace.yaml
└── package.json
```

---

## Coding Standards

### TypeScript

- Strict mode enabled everywhere
- Prefer `type` over `interface` for object shapes (use `interface` for class contracts)
- Always type function return values explicitly in the backend
- Use Zod for runtime validation; derive TypeScript types with `z.infer<>`

### Backend (Express)

- Routes register in `src/routes/index.ts`
- Controllers handle request/response; services handle business logic
- All errors go through `AppError` — never `res.status(xxx).json(...)` directly in routes
- Use the `validate()` middleware to validate request bodies before the handler

### Frontend (React)

- Components live in `src/components/`
- Zustand stores live in `src/store/`
- TanStack Query hooks live in `src/hooks/`
- Pages live in `src/pages/`
- Shared logic goes to `src/lib/`

### Shared Package

- Only pure TypeScript/Zod — no framework deps (no React, no Express)
- Export everything from `src/index.ts`
- Import as `@notepad/shared` in both frontend and backend

---

## OpenSpec Workflow

This project uses [OpenSpec](https://openspec.dev) for spec-driven development.

```bash
# Propose a new change
openspec propose

# Apply (implement) a change
/openspec-apply-change

# Archive a completed change
/openspec-archive-change
```

Changes live in `openspec/changes/<change-id>/`.

---

## Environment Setup

1. Copy `.env.example` to `.env` in the root
2. Set `DATABASE_URL` to your PostgreSQL connection string
3. Set `JWT_SECRET` to a random 32+ character string
4. Run `pnpm install`
5. Run `pnpm --filter @notepad/api db:migrate` to run migrations
6. Run `pnpm dev` to start all apps

---

## Testing

- **Framework**: Vitest
- **Frontend**: jsdom environment with @testing-library
- **Backend**: node environment with supertest
- **Shared**: node environment

Run tests with `pnpm test`. Coverage with `pnpm test:coverage`.
