<script>
	import SVG from './SVG.svelte';

	let { svg, alt = '', source = '' } = $props();

	let cleanSource = $derived(source.replace(/[<>]/g, ''));
</script>

<figure>
	<SVG {svg} />
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
	}
</style>
