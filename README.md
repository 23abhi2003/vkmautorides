# VKM Auto Rides — Web

Next.js (App Router) frontend, matching the structure of the
`anjaneyadecorationsvkm` project: `lib/api.ts` calls the sibling `api/`
Worker with a bearer token, `lib/Auth.tsx` is a simple phone/PIN gate stored
in `localStorage`, `components/AppShell.tsx` provides the sidebar/drawer nav.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your API
npm run dev                        # http://localhost:3000
```

Default sign-in (change in `lib/Auth.tsx` before deploying):
- Phone: `9999999999`
- PIN: `1234`

## Pages

- `/` — Dashboard: totals, net profit, fare-vs-diesel trend chart, driver leaderboard
- `/rides` — log & list rides (date, route, distance, fare)
- `/diesel` — log & list fuel refills (liters, cost/liter, total, odometer)
- `/payments` — log & list money paid to the driver
- `/drivers` — add drivers (schema supports more than one, even though you're starting with one)
- `/login` — phone/PIN sign-in

## Deploying

Build for Cloudflare Pages the same way as the sister repo, or `next build && next start`
on any Node host. Set `NEXT_PUBLIC_API_URL` to the deployed Worker's URL.
