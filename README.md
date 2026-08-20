# Timetable Web

Web application for viewing college timetable schedules (MGKCT), with group/teacher search, bell schedules, and theme personalization.

## Requirements
- Node.js 18+
- npm 9+

## Development Setup

Install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

## Production Build

Typecheck and generate the production bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Cloudflare Worker Proxy

Browser CORS restrictions require college timetable requests (`mgkct.minskedu.gov.by`) to be proxied.

Worker configuration and source code are located in the `worker/` directory:
- `worker/index.js`: Service Worker proxy restricting requests to `*.mgkct.minskedu.gov.by`
- `worker/wrangler.toml`: Cloudflare Worker configuration

Deploy the worker:
```bash
npx wrangler deploy --config worker/wrangler.toml
```

## Project Structure
- `src/features/`: Feature modules (schedule, alarms, staff, settings)
- `src/components/`: Shared UI components
- `src/utils/`: Network fetchers, HTML parser, and dynamic favicon generator
- `src/data/`: Data models and teacher directory
- `worker/`: Cloudflare Worker CORS proxy source and config
