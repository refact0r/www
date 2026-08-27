<script>
	let inspo = $state(null);
	let error = $state(false);

	$effect(() => {
		fetch('/inspo.json')
			.then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
			.then((data) => (inspo = data))
			.catch(() => (error = true));
	});

	function hostname(url) {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	}
</script>

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
			{#each inspo.items as item (item.id)}
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
								loading="lazy"
								onload={(e) => (e.target.style.opacity = 1)}
								style:aspect-ratio={item.imageWidth && item.imageHeight
									? `${item.imageWidth} / ${item.imageHeight}`
									: undefined}
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
		columns: 3;
		column-gap: 1rem;
	}

	.item {
		break-inside: avoid;
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

	@media (max-width: 1400px) {
		.grid {
			columns: 2;
		}
	}

	@media (max-width: 850px) {
		main {
			padding-left: 1.5rem;
			padding-right: 1.5rem;
		}
		.grid {
			columns: 1;
		}
	}
</style>
