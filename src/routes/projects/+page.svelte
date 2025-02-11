<script>
	import Image from '$lib/components/Image.svelte';

	export let data;
</script>

<main>
	<h1>projects</h1>

	<div class="posts">
		{#each data.posts as post}
			<a href={'/projects/' + post.slug} class="link">
				<Image
					image={post.thumbnail}
					alt={post.description}
					sizes="(min-width: 1200px) 50vw, 100vw"
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
		padding: 0 5rem 5rem 5rem;
	}

	.posts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
		gap: 2.5rem;
		max-width: 100%;
	}

	h2 {
		margin: 1rem 0 0.5rem 0;
		color: var(--txt);
		font-size: 1.6rem;
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
