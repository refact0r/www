import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import fs from 'node:fs';

// Serves /inspo.json and /github.json during `vite dev`, where the cloudflare
// worker (worker/index.js) that normally provides them doesn't run. Reads
// CONVEX_URL from .dev.vars and vars from wrangler.jsonc, and fetches straight
// from the sources (no KV cache).
function workerDev() {
	const wranglerVars = () =>
		JSON.parse(fs.readFileSync('wrangler.jsonc', 'utf8').replace(/^\s*\/\/.*$/gm, '')).vars;

	const handlers = {
		'/inspo.json': async () => {
			const { fetchInspo } = await import('./worker/index.js');
			const devVars = Object.fromEntries(
				fs
					.readFileSync('.dev.vars', 'utf8')
					.split('\n')
					.filter((line) => line.includes('='))
					.map((line) => {
						const i = line.indexOf('=');
						return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
					})
			);
			return fetchInspo(
				devVars.CONVEX_URL,
				wranglerVars()
					.INSPO_COLLECTIONS.split(',')
					.map((name) => name.trim())
			);
		},
		'/github.json': async () => {
			const { fetchGithub } = await import('./worker/index.js');
			return fetchGithub(wranglerVars().GITHUB_USERNAME);
		}
	};

	return {
		name: 'worker-dev',
		apply: 'serve',
		configureServer(server) {
			for (const [path, handler] of Object.entries(handlers)) {
				server.middlewares.use(path, async (req, res) => {
					res.setHeader('Content-Type', 'application/json');
					try {
						res.end(JSON.stringify(await handler()));
					} catch (err) {
						res.statusCode = 503;
						res.end(JSON.stringify({ error: err.message }));
					}
				});
			}
		}
	};
}

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit(),
		Icons({
			compiler: 'svelte'
		}),
		workerDev()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
