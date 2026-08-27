// Serves /inspo.json (from the re-collect Convex deployment) and /github.json
// (from github's public contribution calendar) out of KV, refreshed daily by
// cron. All other requests fall through to static assets.

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

// Also used by the vite dev middleware. Scrapes the public contribution
// calendar (no token needed): cell dates/levels come from <td data-date
// data-level>, per-day counts from the matching <tool-tip> elements.
export async function fetchGithub(username) {
	const res = await fetch(`https://github.com/users/${username}/contributions`, {
		headers: { 'User-Agent': 'refact0r.dev worker' }
	});
	if (!res.ok) throw new Error(`github contributions: HTTP ${res.status}`);
	const html = await res.text();

	const counts = {};
	for (const [, id, count] of html.matchAll(
		/for="(contribution-day-component[\d-]+)"[^>]*>\s*(No|[\d,]+) contribution/g
	)) {
		counts[id] = count === 'No' ? 0 : Number(count.replaceAll(',', ''));
	}

	const days = [];
	for (const [tag] of html.matchAll(/<td[^>]*data-date="[^"]*"[^>]*>/g)) {
		const date = tag.match(/data-date="([^"]+)"/)[1];
		const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
		const id = tag.match(/id="([^"]+)"/)?.[1];
		days.push({ date, level, count: counts[id] ?? 0 });
	}
	if (days.length === 0) throw new Error('github contributions: no days parsed');
	days.sort((a, b) => (a.date < b.date ? -1 : 1));

	return {
		updatedAt: Date.now(),
		user: username,
		total: days.reduce((sum, day) => sum + day.count, 0),
		days
	};
}

function collectionNames(env) {
	return env.INSPO_COLLECTIONS.split(',').map((name) => name.trim());
}

const SOURCES = {
	inspo: {
		path: '/inspo.json',
		fetch: (env) => fetchInspo(env.CONVEX_URL, collectionNames(env))
	},
	github: {
		path: '/github.json',
		fetch: (env) => fetchGithub(env.GITHUB_USERNAME)
	}
};

async function refresh(env, key) {
	const data = await SOURCES[key].fetch(env);
	await env.INSPO_KV.put(key, JSON.stringify(data));
	return data;
}

export default {
	async scheduled(controller, env) {
		const errors = [];
		for (const key of Object.keys(SOURCES)) {
			try {
				await refresh(env, key);
				await env.INSPO_KV.put(`${key}:status`, JSON.stringify({ lastRun: Date.now(), ok: true }));
			} catch (err) {
				errors.push(`${key}: ${err.message}`);
				await env.INSPO_KV.put(
					`${key}:status`,
					JSON.stringify({ lastRun: Date.now(), ok: false, error: err.message })
				);
			}
		}
		if (errors.length > 0) throw new Error(errors.join('; '));
	},

	async fetch(request, env) {
		const url = new URL(request.url);

		for (const key of Object.keys(SOURCES)) {
			if (url.pathname === SOURCES[key].path) {
				let body = await env.INSPO_KV.get(key);
				if (!body) {
					try {
						body = JSON.stringify(await refresh(env, key));
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
		}

		return env.ASSETS.fetch(request);
	}
};
