# RAVEN

RAVEN is a split frontend/backend security-checking project:

- `backend/` contains the Express API and analysis services.
- `raven-app-vite/` contains the React + Vite frontend.
- `docs/` contains planning and product documents.

## Repository Layout

- `backend/` - Node.js API server
- `raven-app-vite/` - Vite frontend
- `docs/` - Project docs and planning notes
- `scratch/` - Temporary working files
- `.gitignore`

## Getting Started

### Backend

```bash
cd backend
npm install
npm run start
```

The backend entrypoint is `backend/src/server.js`.

### Frontend

```bash
cd raven-app-vite
npm install
npm run dev
```

## Available Scripts

### Backend

- `npm run start` - start the API server
- `npm run dev` - start the API server in the current mode
- `npm run smoke` - run the backend smoke test

### Frontend

- `npm run dev` - start the Vite dev server
- `npm run build` - build the production bundle
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

## Notes

- The backend is written as ES modules.
- The frontend lives in its own Vite project folder.
- Keep generated files such as `node_modules/` and `dist/` out of version control.
