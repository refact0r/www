# www

My personal website/portfolio/blog. Includes about, projects, blog posts, photos, design inspo, and contact info.

## Stack

- SvelteKit (Svelte 5) with `@sveltejs/adapter-static` — fully prerendered
- Vanilla CSS: global `src/app.css` + scoped component styles
- Content: mdsvex + shiki highlighting (`svelte.config.js`), `@sveltejs/enhanced-img` for responsive images
- Deployment: Cloudflare Workers via wrangler — static assets from `build/` plus a small worker

## Structure

- `src/routes/` — route tree. Every page/layout load returns a `meta` object for SEO (rendered by `src/lib/components/PageHead.svelte`)
- `src/content/` — mdsvex content (blog posts, projects) and images for the photos page
- `src/lib/` — `components/` (shared Svelte components), `js/` (utilities: post loaders, icons, formatting), `assets/` (fonts, lottie animations, shiki css)
- `worker/index.js` — serves `/inspo.json` from KV, refreshed daily by cron from the re-collect Convex deployment (`CONVEX_URL` secret + `INSPO_COLLECTION` var, see `wrangler.jsonc`). All other requests fall through to static assets. Note: plain `vite dev` doesn't run the worker — use `npx wrangler dev` to test `/inspo`

## Conventions

- Use bun for package management (`bun install`, `bun add`) and running scripts (`bun run dev`) — the lockfile is `bun.lockb`
- Svelte 5 only (runes) — do not use deprecated Svelte 4 syntax
- Site text is lowercase; match existing page styles and use global colors from `app.css` (`--bg-*`, `--txt-*`)
- Format/lint with `npm run lint` (prettier + eslint); tests via `npm run test` (playwright + vitest)

## Svelte MCP

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
