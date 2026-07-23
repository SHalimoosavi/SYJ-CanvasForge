# Deployment Guide

SYJ-CanvasForge builds to a fully static bundle (`dist/`) with no server-side requirements, so it can be hosted anywhere that serves static files.

## GitHub Pages (automated)

The repository includes a ready-to-use workflow at [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

1. In your repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or manually trigger the workflow from the **Actions** tab).
4. The workflow installs dependencies, runs `npm run build`, and publishes `dist/` to GitHub Pages automatically.

Your site will be available at `https://<your-username>.github.io/SYJ-CanvasForge/`.

> The app uses a hash-based router (`/#/pdf`, `/#/image`, ...) specifically so it works correctly on GitHub Pages without any server rewrite rules.

### Manual GitHub Pages deployment

If you'd rather not use Actions:

```bash
npm run build
npx gh-pages -d dist
```

(Requires `npm install -D gh-pages` first, and `gh-pages` as the source branch in your repository settings.)

## Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Vercel auto-detects the Vite framework preset. Confirm these settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
3. Deploy. Every push to your default branch will trigger a new deployment automatically.

No environment variables or serverless functions are required — this is a pure static deployment.

## Any other static host (Netlify, Cloudflare Pages, S3, etc.)

```bash
npm install
npm run build
```

Upload the contents of `dist/` to your host of choice. Configure:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Since routing is hash-based, no rewrite/redirect rules are needed for client-side routes.

## Production build commands reference

```bash
npm install       # install dependencies
npm run typecheck # verify TypeScript types
npm run lint       # verify code style
npm run test       # run the test suite
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build locally for a final check
```
