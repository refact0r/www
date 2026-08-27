// Serves /inspo.json from KV, refreshed daily by cron from the re-collect
// Convex deployment. All other requests fall through to static assets.

const KV_KEY = 'inspo';

async function convexQuery(convexUrl, path, args) {
	const res = await fetch(`${convexUrl}/api/query`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ path, args, format: 'json' })
	});
	if (!res.ok) throw new Error(`convex ${path}: HTTP ${res.status}`);
	const data = await res.json();
	if (data.status !== 'success') throw new Error(`convex ${path}: ${data.errorMessage}`);
	return data.value;
}

// Also used by the vite dev middleware (vite.config.js) so /inspo.json works in dev.
// Merges the named collections into one list, newest first.
export async function fetchInspo(convexUrl, collectionNames) {
	const collections = await convexQuery(convexUrl, 'collections:listWithCounts', {});

	const items = [];
	for (const name of collectionNames) {
		const collection = collections.find((c) => c.name === name);
		if (!collection) throw new Error(`collection "${name}" not found`);

		const collectionItems = await convexQuery(convexUrl, 'items:listByCollection', {
			collectionId: collection._id
		});
		for (const item of collectionItems) {
			// Items can belong to multiple collections; keep the first occurrence
			if (!items.some((existing) => existing.id === item._id)) {
				items.push({
					id: item._id,
					collection: name,
					type: item.type,
					title: item.title,
					url: item.url,
					content: item.content,
					imageUrl: item.imageUrl,
					imageWidth: item.imageWidth,
					imageHeight: item.imageHeight,
					dateAdded: item.dateAdded
				});
			}
		}
	}
	items.sort((a, b) => b.dateAdded - a.dateAdded);

	return {
		updatedAt: Date.now(),
		collections: collectionNames,
		items
	};
}

function collectionNames(env) {
	return env.INSPO_COLLECTIONS.split(',').map((name) => name.trim());
}

async function refresh(env) {
	const data = await fetchInspo(env.CONVEX_URL, collectionNames(env));
	await env.INSPO_KV.put(KV_KEY, JSON.stringify(data));
	return data;
}

export default {
	async scheduled(controller, env) {
		try {
			await refresh(env);
			await env.INSPO_KV.put(`${KV_KEY}:status`, JSON.stringify({ lastRun: Date.now(), ok: true }));
		} catch (err) {
			await env.INSPO_KV.put(
				`${KV_KEY}:status`,
				JSON.stringify({ lastRun: Date.now(), ok: false, error: err.message })
			);
			throw err;
		}
	},

	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/inspo.json') {
			let body = await env.INSPO_KV.get(KV_KEY);
			if (!body) {
				try {
					body = JSON.stringify(await refresh(env));
				} catch (err) {
					return new Response(JSON.stringify({ error: err.message }), {
						status: 503,
						headers: { 'Content-Type': 'application/json' }
					});
				}
			}
			return new Response(body, {
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=3600'
				}
			});
		}

		return env.ASSETS.fetch(request);
	}
};
