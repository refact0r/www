<script>
	import Arrow from '$lib/components/Arrow.svelte';
	import { formatDate } from '$lib/js/utils.js';
	import { iconMap } from '$lib/js/icons.js';
	import RssIcon from '~icons/ph/rss';

	let { data } = $props();
</script>

<main>
	<div class="header">
		<h1>
			blog<span class="count" aria-label="{data.posts.length} posts">[{data.posts.length}]</span>
		</h1>
		<a href="/blog/rss.xml" class="rss-link"><RssIcon /> rss</a>
	</div>

	<div class="posts">
		{#each data.posts as post}
			{@const Icon = iconMap[post.icon]}
			<a href={'/blog/' + post.slug} class="link">
				<div class="date">{formatDate(post.date)}</div>
				<h2>
					{#if post.icon}
						<Icon class="icon" />
					{/if}{post.name}<Arrow />
				</h2>
				<div class="description">{post.description}</div>
			</a>
		{/each}
	</div>
</main>

<style>
	main {
		width: 100%;
		max-width: 53rem;
		margin: 0 auto 10rem auto;
		padding: 0 1.5rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.rss-link {
		font-family: 'Space Mono', monospace;
		color: var(--txt-2);
		text-decoration: none;

		:global(svg) {
			font-size: 1.125em;
			vertical-align: middle;
		}
	}

	.rss-link:hover {
		color: var(--txt);
	}

	.posts {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 100%;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0;
		color: var(--txt);
	}

	.count {
		color: var(--bg-3);
	}

	h2 :global(.icon) {
		margin-right: 0.75ch;
	}

	.date {
		font-size: 1.125rem;
		font-family: 'Space Mono', monospace;
		color: var(--txt-2);
		margin-top: 0.25rem;
	}

	.link {
		display: grid;
		grid-template-columns: auto auto;
		justify-content: left;
		gap: 0.5rem 2rem;
	}

	.description {
		grid-column: 2;
	}

	@media (max-width: 600px) {
		.link {
			grid-template-columns: auto;
			gap: 0.5rem;

			.description {
				grid-column: 1;
			}
		}
	}
</style>
