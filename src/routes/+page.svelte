<script>
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
		<p>hey there! i'm yifan. i care about how software works, learns, and feels.</p>
		<nav>
			<a class="nav" href="/about">
				<span class="arrow">-></span><span class="slash">/</span>about
			</a>
			<a class="nav" href="/projects">
				<span class="arrow">-></span><span class="slash">/</span>projects
			</a>
			<a class="nav" href="/blog">
				<span class="arrow">-></span><span class="slash">/</span>blog
			</a>
			<a class="nav" href="/pics">
				<span class="arrow">-></span><span class="slash">/</span>pics
			</a>
			<a class="nav" href="/contact">
				<span class="arrow">-></span><span class="slash">/</span>contact
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

	@media (max-width: 600px) {
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
