<script>
	import Image from '$lib/components/Image.svelte';

	let { data } = $props();
</script>

<main>
	<h1>
		projects<span class="count" aria-label="{data.posts.length} projects"
			>[{data.posts.length}]</span
		>
	</h1>
	<div class="posts">
		{#each data.posts as post, index}
			<a href={'/projects/' + post.slug} class="link">
				<Image
					image={post.thumbnail}
					alt={post.description}
					sizes="(min-width: 1200px) 50vw, 100vw"
					loading={index < 6 ? 'eager' : 'lazy'}
					fetchpriority={index < 3 ? 'high' : 'auto'}
					--aspect-ratio="16/9"
				/>
				<h2>{post.name}<span class="arrow">-></span></h2>
				<div class="description">{post.description}</div>
			</a>
		{/each}
	</div>
</main>

<style>
	main {
		padding: 0 4rem 4rem 4rem;
	}

	.posts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
		gap: 2rem;
		max-width: 100%;
	}

	h2 {
		margin: 0.75rem 0 0.25rem 0;
		color: var(--txt);
		font-size: 1.5rem;
	}

	.count {
		color: var(--bg-3);
	}

	a :global(picture) {
		position: relative;
	}

	a :global(picture::after) {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		opacity: 0;
		z-index: -1;
		border: 2px solid var(--bg-3);
		transition: 0.1s;
	}

	a:hover :global(picture::after) {
		top: -0.5rem;
		left: -0.5rem;
		right: -0.5rem;
		bottom: -0.5rem;
		opacity: 1;
	}

	@media (max-width: 850px) {
		main {
			padding-left: 1.5rem;
			padding-right: 1.5rem;
		}
		.posts {
			grid-template-columns: auto;
		}
	}
</style>
