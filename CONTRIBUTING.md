# Contributing to EMS

Welcome to EMS! Please review these guidelines before submitting code or opening a pull request.

---

## 1. Getting Started

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   ```
2. **Set up local environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials and NextAuth secret. See [`docs/architecture.md`](docs/architecture.md) for details.
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application runs at `http://localhost:3000` using Next.js with Turbopack.

---

## 2. File & Component Naming Conventions

All files across `components/`, `app/`, `hooks/`, and `lib/` must adhere to consistent conventions:

- **Filenames**: Use `kebab-case` for all custom file and directory names (e.g. `event-creation-page.tsx`, `top-bar.tsx`, `use-after-event-report.ts`).
- **Component Exports**: Use `PascalCase` for React component definitions and named/default exports (e.g. `export function EventCreationPage()`, `TopBar.displayName = "TopBar"`).
- **Next.js Routing Files**: Preserve Next.js reserved filenames (`page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`, and dynamic route folders like `[id]`, `[clubId]`).

---

## 3. Pre-PR Checklist

Before pushing commits or submitting a pull request, verify that all checks pass locally with zero errors and zero warnings:

```bash
# 1. Type checking
npx tsc --noEmit

# 2. Linting (ESLint 9 + Prettier)
npm run lint

# 3. Unit & Integration Tests (Vitest)
npm test

# 4. Production Build (Next.js Turbopack)
npm run build
```

Any lint warning or build failure will block CI/CD pipelines.

---

## 4. Architecture & Design Documentation

For a comprehensive overview of the application architecture, database schemas, authorization models, and API routes, refer to:

- [`docs/architecture.md`](docs/architecture.md) — Core tech stack, directory layout, and API specifications.
- [`docs/club-dashboard.md`](docs/club-dashboard.md) — Club dashboard architecture and calendar database schema.
- [`docs/supabase-storage-setup.md`](docs/supabase-storage-setup.md) — Supabase Storage buckets, security policies, and migrations.
