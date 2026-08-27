<script>
	let data = $state(null);
	let error = $state(false);

	$effect(() => {
		fetch('/github.json')
			.then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
			.then((json) => (data = json))
			.catch(() => (error = true));
	});

	// The first day may not be a sunday; shift it down so weekday rows line up.
	const offset = $derived(data ? new Date(data.days[0].date).getUTCDay() : 0);
	const cols = $derived(data ? Math.ceil((data.days.length + offset) / 7) : 0);

	// Hue sweeps left to right through the site's primary colors
	// (pink -> purple -> blue); the contribution level sets the intensity.
	function cellColor(i) {
		const t = cols > 1 ? Math.floor((i + offset) / 7) / (cols - 1) : 0;
		return t < 0.5
			? `color-mix(in oklab, var(--purple) ${(t * 200).toFixed(1)}%, var(--pink))`
			: `color-mix(in oklab, var(--blue) ${((t - 0.5) * 200).toFixed(1)}%, var(--purple))`;
	}

	function label(day) {
		const date = new Date(day.date)
			.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
			.toLowerCase();
		return `${day.count} contribution${day.count === 1 ? '' : 's'} on ${date}`;
	}
</script>

{#if error}
	<p class="muted">couldn't load contributions. try again later?</p>
{:else if !data}
	<p class="muted">loading...</p>
{:else}
	<div class="scroll">
		<div
			class="graph"
			role="img"
			aria-label="github contribution graph: {data.total} contributions in the last year"
		>
			{#each data.days as day, i (day.date)}
				<span
					class="day"
					data-level={day.level}
					style:--c={day.level > 0 ? cellColor(i) : null}
					style:grid-row-start={i === 0 ? offset + 1 : null}
					title={label(day)}
				></span>
			{/each}
		</div>
	</div>
	<a class="total" href="https://github.com/{data.user}"
		>{data.total} contributions in the last year</a
	>
{/if}

<style>
	.muted {
		color: var(--txt-3);
		font-family: 'Space Mono', monospace;
		font-size: 1.125rem;
		margin: 0.5rem 0;
	}

	.scroll {
		overflow-x: auto;
		margin: 0.5rem 0;
	}

	.graph {
		display: grid;
		grid-template-rows: repeat(7, auto);
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 3px;
		min-width: 40rem;
	}

	.day {
		aspect-ratio: 1;
		background: var(--bg-2);
	}

	.day[data-level='1'] {
		background: color-mix(in oklab, var(--c) 35%, var(--bg));
	}

	.day[data-level='2'] {
		background: color-mix(in oklab, var(--c) 60%, var(--bg));
	}

	.day[data-level='3'] {
		background: color-mix(in oklab, var(--c) 80%, var(--bg));
	}

	.day[data-level='4'] {
		background: var(--c);
	}

	.total {
		display: block;
		width: fit-content;
		margin: 0.5rem 0;
		font-family: 'Space Grotesk Variable', sans-serif;
		font-size: 1.125rem;
		color: var(--txt-3);
		transition: color 0.2s;
	}

	.total:hover {
		color: var(--txt);
	}
</style>
