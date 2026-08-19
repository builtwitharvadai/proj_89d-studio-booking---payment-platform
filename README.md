# Studio Booking & Payment Platform

A comprehensive booking platform for a studio business that enables clients to view availability, book sessions online, process payments securely, and receive automated reminders. The system streamlines the booking workflow, reduces no-shows through timely notifications, and provides a professional client-facing interface that reflects the studio's brand.

## Tech Stack

- **Frontend:** Next.js (React), TypeScript
- **Backend:** Express.js, TypeScript
- **Shared:** TypeScript types shared between frontend and backend
- **Package Manager:** pnpm workspaces
- **Tooling:** ESLint, Prettier, TypeScript strict mode

## Monorepo Structure

```
studio-booking-payment-platform/
├── apps/
│   ├── frontend/          # Next.js client-facing application
│   └── backend/           # Express.js API server
├── packages/
│   └── shared/            # Shared TypeScript types and utilities
├── package.json           # Root workspace configuration
├── pnpm-workspace.yaml    # pnpm workspace definitions
├── tsconfig.json          # Root TypeScript configuration
├── .eslintrc.cjs          # ESLint configuration
├── .prettierrc.json       # Prettier configuration
└── README.md
```

## Prerequisites

- **Node.js:** `>= 18.0.0`
- **pnpm:** `>= 8.0.0`

Install pnpm globally if you haven't already:

```bash
npm install -g pnpm@8
```

## Installation

Clone the repository and install dependencies for all workspaces:

```bash
pnpm install
```

## Development Commands

Run these commands from the repository root:

| Command        | Description                                             |
| -------------- | ------------------------------------------------------- |
| `pnpm dev`     | Start development servers for all workspaces            |
| `pnpm build`   | Build all workspaces for production                     |
| `pnpm test`    | Run tests across all workspaces                         |
| `pnpm lint`    | Lint all workspaces with ESLint                         |
| `pnpm format`  | Format the codebase with Prettier                       |

To target a specific workspace, use pnpm's `--filter` flag:

```bash
pnpm --filter @studio/backend dev
pnpm --filter @studio/frontend dev
```

## Project Structure Explanation

- **`apps/frontend`** — Next.js application providing the client-facing booking UI, admin dashboard, and account management flows.
- **`apps/backend`** — Express.js REST API handling authentication, bookings, payments, notifications, and integrations (Stripe, email, SMS).
- **`packages/shared`** — Shared TypeScript types, DTOs, and utilities consumed by both the frontend and backend to guarantee end-to-end type safety.

## Contribution Guidelines

_Contribution guidelines will be documented here._
