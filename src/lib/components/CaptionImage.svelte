<script>
	import Image from './Image.svelte';

	let { image, alt = '', source = '', sizes = '', loading = '' } = $props();

	let cleanSource = $derived(source.replace(/[<>]/g, ''));
</script>

<figure>
	<Image {image} {alt} {sizes} {loading} />
	{#if alt !== ''}
		<figcaption>
			{alt}
			{#if cleanSource !== ''}
				<a href={cleanSource}>source</a>{/if}
		</figcaption>
	{/if}
</figure>

<style>
	figcaption {
		font-size: 1rem;
		text-align: center;
		margin-top: 1.5rem;
		color: var(--txt-2);
	}
</style>
