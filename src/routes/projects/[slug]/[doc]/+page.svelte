<script>
	let { data } = $props();

	let { default: Content } = $derived(data.document);
</script>

<main>
	<div class="head">
		<a href="/projects/{data.slug}" class="back"><span class="arrow">&lt;-</span>{data.slug}</a>
	</div>
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
</style>
