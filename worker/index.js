// Serves /inspo.json from KV, refreshed daily by cron from the re-collect
// Convex deployment. All other requests fall through to static assets.

const KV_KEY = 'inspo';

async function convexQuery(env, path, args) {
	const res = await fetch(`${env.CONVEX_URL}/api/query`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ path, args, format: 'json' })
	});
	if (!res.ok) throw new Error(`convex ${path}: HTTP ${res.status}`);
	const data = await res.json();
	if (data.status !== 'success') throw new Error(`convex ${path}: ${data.errorMessage}`);
	return data.value;
}

async function refresh(env) {
	const collections = await convexQuery(env, 'collections:listWithCounts', {});
	const collection = collections.find((c) => c.name === env.INSPO_COLLECTION);
	if (!collection) throw new Error(`collection "${env.INSPO_COLLECTION}" not found`);

	const items = await convexQuery(env, 'items:listByCollection', {
		collectionId: collection._id
	});

	const data = {
		updatedAt: Date.now(),
		collection: collection.name,
		items: items.map((item) => ({
			id: item._id,
			type: item.type,
			title: item.title,
			url: item.url,
			content: item.content,
			imageUrl: item.imageUrl,
			imageWidth: item.imageWidth,
			imageHeight: item.imageHeight
		}))
	};

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
