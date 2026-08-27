<script>
	let inspo = $state(null);
	let error = $state(false);
	let width = $state(null);

	$effect(() => {
		fetch('/inspo.json')
			.then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
			.then((data) => (inspo = data))
			.catch(() => (error = true));
	});

	const colCount = $derived(width === null ? 3 : width <= 850 ? 1 : width <= 1400 ? 2 : 3);

	// Distribute items (newest first) into the currently-shortest column so
	// recency reads across the top. Heights are known up front from the stored
	// image dimensions, so no DOM measurement is needed.
	const columns = $derived.by(() => {
		if (!inspo) return [];
		const cols = Array.from({ length: colCount }, () => ({ height: 0, items: [] }));
		inspo.items.forEach((item, index) => {
			const ratio = item.imageWidth && item.imageHeight ? item.imageHeight / item.imageWidth : 0.8;
			const col = cols.reduce((a, b) => (b.height < a.height ? b : a));
			// Eagerly load roughly the first two rows; lazy-load the rest
			col.items.push({ ...item, eager: index < colCount * 2 });
			col.height += ratio + 0.1;
		});
		return cols.map((col) => col.items);
	});

	function hostname(url) {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	}
</script>

<svelte:window bind:innerWidth={width} />

<main>
	<h1>
		inspo{#if inspo}<span class="count" aria-label="{inspo.items.length} items"
				>[{inspo.items.length}]</span
			>{/if}
	</h1>
	<p>design inspiration collected from around the web.</p>
	<br />
	{#if error}
		<p class="muted">couldn't load items. try again later?</p>
	{:else if !inspo}
		<p class="muted">loading...</p>
	{:else}
		<div class="grid">
			{#each columns as col, i (i)}
				<div class="col">
					{#each col as item (item.id)}
						<div class="item">
							{#if item.imageUrl}
								<a
									href={item.url ?? item.imageUrl}
									target="_blank"
									rel="noopener noreferrer"
									title={item.title}
								>
									<img
										src={item.imageUrl}
										alt={item.title ?? ''}
										width={item.imageWidth}
										height={item.imageHeight}
										loading={item.eager ? 'eager' : 'lazy'}
										decoding="async"
										onload={(e) => (e.target.style.opacity = 1)}
									/>
								</a>
							{:else if item.type === 'text'}
								<div class="text-card">{item.content}</div>
							{/if}
							{#if item.type === 'url' && item.url}
								<a class="caption" href={item.url} target="_blank" rel="noopener noreferrer"
									>{hostname(item.url)}</a
								>
							{:else if item.title}
								<span class="caption">{item.title}</span>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		padding: 0 4rem 4rem 4rem;
	}

	.count {
		color: var(--bg-3);
	}

	.muted {
		color: var(--txt-3);
	}

	.grid {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.col {
		flex: 1;
		min-width: 0;
	}

	.item {
		margin-bottom: 1rem;
	}

	img {
		transition: opacity 0.2s;
		opacity: 0;
		width: 100%;
		height: auto;
		display: block;
		border: 1px solid var(--bg-2);
	}

	.text-card {
		border: 1px solid var(--bg-2);
		padding: 1rem;
		white-space: pre-wrap;
	}

	.caption {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.875rem;
		color: var(--txt-3);
	}

	a.caption:hover {
		color: var(--txt);
	}

	@media (max-width: 850px) {
		main {
			padding-left: 1.5rem;
			padding-right: 1.5rem;
		}
	}
</style>
