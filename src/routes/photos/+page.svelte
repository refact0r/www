<script>
	let { data } = $props();
	const images = data.images;
</script>

<main>
	<h1>photos<span class="count" aria-label="{images.length} photos">[{images.length}]</span></h1>
	<p>just some random photos. shot on pixel 8, pixel 5a, and pixel 2.</p>
	<br />
	<div class="grid">
		{#each images as image (image.img.src)}
			<picture>
				<source srcset={image.sources.avif} type="image/avif" />
				<source srcset={image.sources.webp} type="image/webp" />
				<img
					src={image.img.src}
					alt=""
					loading="lazy"
					onload={(e) => (e.target.style.opacity = 1)}
					width={image.img.w}
					height={image.img.h}
				/>
			</picture>
		{/each}
	</div>
</main>

<style>
	main {
		padding: 0 4rem 4rem 4rem;
	}

	.count {
		color: var(--bg-3);
	}

	.grid {
		columns: 3;
		column-gap: 1rem;
		column-fill: balance;
	}

	picture {
		display: block;
		overflow: hidden;
		break-inside: avoid;
		margin-bottom: 1rem;
	}

	img {
		transition: opacity 0.2s;
		opacity: 0;
		width: 100%;
		height: auto;
		display: block;
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
