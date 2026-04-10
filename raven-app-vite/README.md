# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Backend

Run the local API from the repo root in a second terminal:

```bash
node backend/server.js
```

The Vite dev server proxies `/api` to `http://127.0.0.1:8788`, so the frontend can call the backend with a relative request.
By default Vite runs on `http://localhost:5173`, so that is the frontend URL to open during local development.

Optional environment variables for the backend:

- `SUPERVITY_WORKFLOW_ID`
- `SUPERVITY_BEARER_TOKEN`
- `SUPERVITY_API_URL`
- `ALLOWED_ORIGINS`

`backend/server.js` will read these from `backend/.env`, `backend/.env.local`, or the repo root `.env.local` if present.
For a Next.js API route, keep them in the Next project root `.env.local` instead.

If those Supervity credentials are missing, the backend returns a configuration error instead of a fabricated report. That keeps the frontend honest and makes it obvious when the live workflow is not connected.
