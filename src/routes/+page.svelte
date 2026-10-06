<script>
	import Arrow from '$lib/components/Arrow.svelte';
	import AsciiField from '$lib/components/AsciiField.svelte';
	import LogoAnimated from '$lib/components/LogoAnimated.svelte';

	let burst = $state(null);
	let burstId = 0;

	function handleLogoAnimationComplete(origin) {
		burst = { ...origin, id: ++burstId };
	}
</script>

<main>
	<AsciiField {burst} />
	<div class="container">
		<div class="row">
			<h1>refact0r</h1>
			<div class="logo">
				<LogoAnimated onAnimationComplete={handleLogoAnimationComplete} />
			</div>
		</div>
		<p>hey there! i'm yifan. i like making things that are both functional and beautiful.</p>
		<nav>
			<a class="nav" href="/about">
				<Arrow /><span class="slash" aria-hidden="true">/</span>about
			</a>
			<a class="nav" href="/projects">
				<Arrow /><span class="slash" aria-hidden="true">/</span>projects
			</a>
			<a class="nav" href="/blog">
				<Arrow /><span class="slash" aria-hidden="true">/</span>blog
			</a>
			<a class="nav" href="/photos">
				<Arrow /><span class="slash" aria-hidden="true">/</span>photos
			</a>
			<a class="nav" href="/inspo">
				<Arrow /><span class="slash" aria-hidden="true">/</span>inspo
			</a>
			<a class="nav" href="/contact">
				<Arrow /><span class="slash" aria-hidden="true">/</span>contact
			</a>
		</nav>
	</div>
</main>

<style>
	main {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		max-height: calc(100vh - 12rem);
		margin: 0 1.5rem;
		isolation: isolate;
	}

	.container {
		position: relative;
		z-index: 1;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.logo {
		width: 3.75rem;
		height: 3.75rem;
	}

	h1 {
		font-size: 3rem;
		margin: 0;
	}

	nav {
		display: flex;
		gap: 2rem;

		a {
			font-size: 1.5rem;
			font-family: 'Space Mono', monospace;
		}
	}

	p {
		font-size: 1.25rem;
		margin: 1rem 0;
	}

	@media (max-width: 720px) {
		nav {
			flex-direction: column;
			gap: 1rem;
		}
		.row {
			flex-direction: column-reverse;
			gap: 0.5rem;
			align-items: flex-start;
		}
	}
</style>
