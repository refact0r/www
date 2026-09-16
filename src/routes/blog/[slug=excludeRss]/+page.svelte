<script>
	import { formatDate } from '$lib/js/utils.js';
	import { iconMap } from '$lib/js/icons.js';

	let { data } = $props();
	let { default: Content, metadata } = $derived(data.post);
	let Icon = $derived(iconMap[metadata.icon]);
</script>

<main>
	<div class="head">
		<a href="/blog" class="back"><span class="arrow">&lt;-</span>blog</a>
	</div>
	<h1>
		<Icon class="icon" />{metadata.name}
	</h1>
	<p class="date">{formatDate(metadata.date)}</p>
	<p class="description">{metadata.description}</p>
	<div class="content">
		<Content />
	</div>
</main>

<style>
	main {
		width: 100%;
		max-width: 53rem;
		margin: 0 auto 10rem auto;
		padding: 1.5rem;
	}

	.content {
		overflow-x: hidden;
		max-width: 100%;
	}

	.date {
		margin: 0.5rem 0;
		font-size: 1.375rem;
		font-family: 'Space Mono', monospace;
	}

	.description {
		font-size: 1.125rem;
		margin: 0.5rem 0 1.5rem 0;
		font-style: italic;
		color: var(--txt-2);
	}

	h1 {
		font-size: 2.5rem;
		margin: 1rem 0;
	}

	h1 :global(.icon) {
		margin-right: 0.75ch;
	}
</style>
