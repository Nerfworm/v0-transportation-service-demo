# HavenWay Transportation Service App

HavenWay is a role-based transportation request and scheduling application for residential clients and staff.

It allows clients to submit transportation requests and gives staff a workflow to review, approve, schedule, assign drivers/vehicles, and track requests from intake to completion.

## Purpose

This app is designed to coordinate transportation for residents (currently tied to house IDs 7 and 8) through a clear operational pipeline:

1. A client submits a request with pickup/destination details and target dropoff time.
2. A reviewer triages the request.
3. A transportation coordinator schedules and assigns the ride.
4. Drivers are notified and transportation appears on the calendar.

The system includes role-based access control, notification delivery, and account management for staff.

## Core User Flows

### Public / Client flow

- Home page provides two entry points: client request and staff sign-in.
- Clients submit transport requests from the Client Request Form.
- The backend calculates pickup timing using Google Routes API (with a fallback buffer if unavailable).

### Staff flow

- Staff authenticate via username/password.
- Staff can register new accounts with roles.
- Staff dashboard includes:
	- Home widgets (request stats, week view snapshot, recent activity placeholder)
	- Review queue for unreviewed requests
	- Calendar view for pending/approved transport and assignment
	- Driver directory (role restricted)
	- Notification bell with mark-as-read behavior
	- Settings page for account/profile updates

## Roles and Permissions

The app uses role IDs shared across frontend and Supabase Edge Functions:

- `1` Admin
- `2` Transportation Coordinator
- `3` Reviewer
- `4` Transporter (Driver)

High-level behavior:

- Admin: full visibility and broad state transitions.
- Transportation Coordinator: scheduling/assignment and calendar/driver operations.
- Reviewer: review queue triage from Unreviewed to Pending or Denied.
- Transporter: receives assignment notifications; restricted from admin/coordinator-only views.

## Request Lifecycle

Implemented request states:

- `Unreviewed` -> initial state for client-submitted requests
- `Pending` -> reviewer-approved and waiting final scheduling/dispatch
- `Approved` -> fully assigned with driver, vehicle, pickup/dropoff times
- `Denied` -> declined with optional reason

State transitions are enforced in the `confirm-request` edge function according to role.

## Architecture

- Frontend: Next.js App Router (React + TypeScript)
- UI: Tailwind CSS + Radix UI primitives
- Backend: Supabase Edge Functions + Supabase Auth + Postgres tables
- Session model: custom `session` cookie handled by edge functions
- Notifications: persisted in `notification` table and surfaced in dashboard bell
- Routing integration: Google Routes API used to estimate travel duration

## Project Structure (Key Areas)

- `app/`: route pages for client, auth, dashboard, and settings
- `components/`: dashboard shell and UI components
- `context/UserContext.tsx`: client-side role/user context
- `lib/edgeClient.ts`: frontend wrappers for edge function calls
- `supabase/functions/`: server-side business logic and authorization

## Environment and Configuration

Frontend expects:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase Edge Functions expect:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_MAPS_API_KEY` (for travel-time estimation)

## Local Development

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deployment

Production deployment is configured on Vercel and Supabase.