import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import fs from 'node:fs';

// Serves /inspo.json during `vite dev`, where the cloudflare worker
// (worker/index.js) that normally provides it doesn't run. Reads CONVEX_URL
// from .dev.vars and INSPO_COLLECTION from wrangler.jsonc, and fetches
// straight from convex (no KV cache).
function inspoDev() {
	return {
		name: 'inspo-dev',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use('/inspo.json', async (req, res) => {
				res.setHeader('Content-Type', 'application/json');
				try {
					const { fetchInspo } = await import('./worker/index.js');
					const vars = Object.fromEntries(
						fs
							.readFileSync('.dev.vars', 'utf8')
							.split('\n')
							.filter((line) => line.includes('='))
							.map((line) => {
								const i = line.indexOf('=');
								return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
							})
					);
					const config = JSON.parse(
						fs.readFileSync('wrangler.jsonc', 'utf8').replace(/^\s*\/\/.*$/gm, '')
					);
					const data = await fetchInspo(
						vars.CONVEX_URL,
						config.vars.INSPO_COLLECTIONS.split(',').map((name) => name.trim())
					);
					res.end(JSON.stringify(data));
				} catch (err) {
					res.statusCode = 503;
					res.end(JSON.stringify({ error: err.message }));
				}
			});
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
		inspoDev()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
