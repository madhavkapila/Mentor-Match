# MentorMatch Frontend

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Shadcn/UI + Framer Motion.

## Setup

```bash
cp .env.sample .env.local   # fill in Turnstile + Google OAuth keys
npm install
npm run dev                  # http://localhost:3000
```

## Build

```bash
npm run build
npm run start                # production server on port 3000
```

## Notes

- API calls use relative URLs (`/api/v1/...`). In dev, Next.js rewrites proxy them to `localhost:8080`. In prod, Nginx handles routing.
- No `NEXT_PUBLIC_API_URL` env var needed.
- See root [README.md](../README.md) for full project documentation.
