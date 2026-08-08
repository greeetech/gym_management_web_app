# Gym Manager — Gym Owner Portal

The **frontend** of the Gym Management System: a responsive single-page application (SPA) for gym owners to run their business — manage members, memberships, plans, subscriptions (billed via Razorpay), and analytics.

Built with **React 19**, **Vite 8**, **Tailwind CSS 4**, and **React Router 7**. It talks to the backend REST API (`gym_management_solution-backend`) through an Axios client rooted at `/gym_owner`.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Pages](#pages)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Key Implementation Details](#key-implementation-details)
- [API Integration](#api-integration)
- [Theming](#theming)

## Tech Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Framework  | React 19 (hooks + context, lazy-loaded routes)          |
| Build tool | Vite 8                                                  |
| Styling    | Tailwind CSS 4 (CSS-first config via `@tailwindcss/vite`) |
| Routing    | React Router 7 (`BrowserRouter`)                        |
| HTTP       | Axios (with request/response interceptors)              |
| Charts     | Recharts 3 (area, bar, donut)                           |
| Icons      | Lucide React                                            |
| Linting    | Oxlint                                                  |

## Features

### Authentication & Account

- **Register** — name, email, password with a live strength meter (5-point `passwordScore`), optional address/gender.
- **Login** — email + password with show/hide toggle; redirects to the originally requested page.
- **Session** — JWT stored in `localStorage`, validated on startup via `GET /profile`, auto-cleared on 401 with a redirect to `/login`.
- **Profile settings** — edit name, email, address, gender.

### Dashboard

- Time-of-day greeting hero with current plan usage and a free-member-limit bar.
- `OnboardingChecklist` (create plan → add member → track renewals).
- KPI stat cards: Total Members, Active Memberships, Total Revenue, Expiry Soon.
- Charts: revenue area, plan distribution donut, membership growth, new members.
- Lists of recent members and memberships expiring soon.

### Members

- Search (debounced 400 ms) by name/phone/email, filter by status, paginated table (10/page).
- Add / edit / delete (with confirmation dialog), profile-photo upload (JPEG/PNG/WebP ≤ 4 MB) via multipart.
- **CSV export** of the current page or all matching members.
- Detail page (`/members/:id`) with profile card, memberships, and quick actions (renew, edit, photo).

### Memberships

- Searchable + filterable + paginated list of member subscriptions.
- New membership modal with auto-computed end date from plan duration; blocks members who already have an active membership.
- Detail drawer with inline status updates (Active / Inactive / Cancelled) and renew action.

### Plans

- CRUD for the owner's own gym plans (name, gross price, selling price, duration).
- Card grid with duration-colored gradients and discount badges; delete guarded by confirmation.

### Billing & Plans (owner subscription)

- Browse SaaS pricing tiers (from `/payment/plans`) with monthly/yearly toggle and member-limit info.
- Purchase flow: `POST /payment/create-payment` → inject the **Razorpay** checkout script → pay → `POST /payment/verify-payment`.
- Paginated payment-history table with CSV export.

### Analytics

- Member status counts, revenue by membership status, revenue over time, plan distribution, membership growth, new members — monthly and yearly.

### UX Extras

- Command palette (`Ctrl/Cmd+K`) to navigate pages, run quick actions, and search members/plans.
- Notification bell showing memberships expiring soon with days-left chips.
- Responsive layout: sidebar (desktop) + fixed bottom tab bar (mobile).
- Skeleton loaders, toast notifications, confirm dialogs, accessible modals/drawers, and an error boundary.

## Pages

| Route                | Page                | Purpose                                              |
| -------------------- | ------------------- | ---------------------------------------------------- |
| `/login`             | `Login.jsx`         | Gym owner sign-in                                    |
| `/register`          | `Register.jsx`      | Gym owner account creation                           |
| `/dashboard`         | `Dashboard.jsx`     | Overview KPIs, charts, checklist                     |
| `/members`           | `Members.jsx`       | Member list, search, filters, CSV export             |
| `/members/:id`       | `MemberDetail.jsx`  | Single member profile                                |
| `/memberships`       | `Memberships.jsx`   | Membership list, status updates, renewals            |
| `/plans`             | `Plans.jsx`         | Owner subscription-plan CRUD                         |
| `/billing`           | `Payments.jsx`      | Owner SaaS subscription + Razorpay checkout + history|
| `/analytics`         | `Analytics.jsx`     | Detailed analytics and charts                        |
| `/settings`          | `Settings.jsx`      | Profile editing + plan usage                         |

All authenticated routes are wrapped in `ProtectedRoute` + `Layout` and lazy-loaded with a spinner fallback.

## Getting Started

### Prerequisites

- Node.js >= 18 and npm
- The backend running locally (see the backend README) — this app proxies `/gym_owner` to it in development

### Install & run

```bash
npm install
npm run dev
```

Vite starts on `http://localhost:5173`. It proxies `/gym_owner` requests to `http://localhost:3001` by default (or whatever `VITE_BACKEND_URL` is set to).

### Build for production

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env` file in the project root (no `.env.example` is shipped; use the table below).

| Variable           | Default                   | Description                                       |
| ------------------ | ------------------------- | ------------------------------------------------- |
| `VITE_API_URL`     | `/gym_owner`              | Axios `baseURL` for all API requests              |
| `VITE_BACKEND_URL` | `http://localhost:3001`    | Vite dev-server proxy target for the `/gym_owner` prefix |

## Scripts

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the Vite dev server with HMR |
| `npm run build` | Build the production bundle        |
| `npm run lint`  | Lint with Oxlint                   |
| `npm run preview` | Preview the production build     |

## Project Structure

```
gym_management_web_app/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Router, providers, lazy routes
│   ├── index.css                 # Tailwind v4 theme + brand tokens
│   ├── pages/                    # One file per route (see table above)
│   ├── components/
│   │   ├── Layout.jsx            # Authenticated app shell (sidebar/header/nav)
│   │   ├── AuthLayout.jsx        # Split-screen branding shell for auth pages
│   │   ├── charts.jsx            # Recharts wrappers (area, bar, donut)
│   │   ├── Modal.jsx             # Accessible modal
│   │   ├── MembershipDetailDrawer.jsx  # Right-side membership details
│   │   ├── MemberForm.jsx        # Add/edit member modal
│   │   ├── MembershipForm.jsx    # New membership modal
│   │   ├── PlanUsage.jsx         # Plan usage card + badge
│   │   ├── OnboardingChecklist.jsx
│   │   ├── CommandPalette.jsx    # Ctrl/Cmd+K command palette
│   │   ├── NotificationBell.jsx  # Expiring-membership alerts
│   │   ├── ProtectedRoute.jsx    # Auth guard
│   │   ├── ConfirmDialog.jsx     # Danger confirmation
│   │   ├── DropdownMenu.jsx      # Menu with outside-click close
│   │   ├── Toast.jsx             # Toast provider + hook
│   │   ├── ErrorBoundary.jsx
│   │   ├── Pagination.jsx, StatusBadge.jsx, StatCard.jsx, Skeleton.jsx,
│   │   ├── Spinner.jsx, MobileNav.jsx, ui.jsx, icons.jsx
│   ├── context/
│   │   ├── AuthContext.jsx              # login/register/logout/profile
│   │   └── OwnerSubscriptionContext.jsx # owner billing + plan usage
│   ├── hooks/
│   │   ├── useFetch.js                  # generic data-fetching hook
│   │   └── useOwnerSubscription.js      # re-export of context hook
│   ├── services/
│   │   └── api.js                       # Axios client + interceptors
│   └── utils/
│       ├── validation.js                # phone/email/password rules
│       ├── format.js                    # INR, dates, initials, masking
│       └── csv.js                       # CSV generation + download
├── vite.config.js
├── package.json
└── README.md
```

## Key Implementation Details

- **API client** (`src/services/api.js`) — Axios instance with `baseURL = VITE_API_URL || '/gym_owner'`. A request interceptor attaches the `x-auth-token` JWT header from `localStorage` (`gym_owner_token`). A response interceptor clears the token and redirects to `/login` on 401.
- **Auth state** — `AuthContext` hydrates the user from `localStorage` (`gym_owner_token`, `gym_owner_user`), validates via `GET /profile`, and exposes `login`, `register`, `logout`, and `refreshProfile`.
- **Owner subscription state** — `OwnerSubscriptionContext` loads the latest billing history (`GET /payment/history?limit=5`) and derives the active/current plan for usage bars and upgrade links.
- **Razorpay checkout** — the page injects `https://checkout.razorpay.com/v1/checkout.js` at runtime, creates an order via `POST /payment/create-payment`, opens the Razorpay modal, then confirms with `POST /payment/verify-payment`.
- **CSV exports** — `utils/csv.js` produces quoted/escaped CSV with a UTF-8 BOM and triggers a download; used on Members and Billing pages.
- **Charts** — `components/charts.jsx` wraps Recharts (`ResponsiveContainer`, `AreaChart`, `BarChart`, `PieChart`) with consistent empty states and tooltips.
- **Accessibility** — skip-to-content link, `role="status"` spinners, escape-to-close modals, focus management, and labelled form fields.

## API Integration

All requests are prefixed with `/gym_owner` (or `VITE_API_URL`). Endpoints consumed:

| Area         | Endpoints used                                                    |
| ------------ | ----------------------------------------------------------------- |
| Auth         | `POST /register`, `POST /login`, `GET /profile`, `PUT /profile`   |
| Members      | `GET /members/get`, `GET /members/get/:id`, `POST /members/add`, `PUT /members/update/:id`, `DELETE /members/delete/:id`, `PUT /members/profile-pic/:id` |
| Memberships  | `GET /memberships/`, `GET /memberships/:id`, `PUT /memberships/:id` |
| Subscriptions| `GET /subscription/get`, `POST /subscription/add`, `PUT /subscription/update/:id`, `DELETE /subscription/del/:id`, `POST /subscription/new/members/:memberId` |
| Payments     | `GET /payment/plans`, `POST /payment/create-payment`, `POST /payment/verify-payment`, `GET /payment/history` |
| Analytics    | `GET /analytics/`, `GET /analytics/membership-status-counts`        |

## Theming

- Tailwind v4 CSS-first config lives in `src/index.css` with `@theme` tokens: an **indigo** `brand` palette, a `violet` accent palette, gradient stops (`#6366f1` → `#8b5cf6`), the **Inter** font, and `fade-in` / `slide-up` / `scale-in` animations.
- Helper classes: `.bg-brand-gradient`, `.bg-brand-gradient-soft`, `.text-gradient`, and `.shimmer` for skeleton loaders.
- The app currently uses a single light theme with indigo/violet branding.
