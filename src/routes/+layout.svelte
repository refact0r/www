<script>
	import '../app.css';
	import '$lib/assets/fonts/space-mono.css';
	import '$lib/assets/fonts/space-grotesk.css';
	import { page } from '$app/state';
	import Logo from '$lib/components/Logo.svelte';
	import PageHead from '$lib/components/PageHead.svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();

	const pages = [
		{ name: 'about', path: '/about' },
		{ name: 'projects', path: '/projects' },
		{ name: 'blog', path: '/blog' },
		{ name: 'pics', path: '/pics' },
		{ name: 'contact', path: '/contact' }
	];

	function calculateTransitionOffsets(from, to) {
		const cleanFrom = from.replace(/\/$/, '');
		const cleanTo = to.replace(/\/$/, '');

		let currDepth = cleanTo.split('/').length;
		let prevDepth = cleanFrom.split('/').length;

		const currParent = '/' + cleanTo.split('/')[1];
		const prevParent = '/' + cleanFrom.split('/')[1];

		let currParentIdx = pages.findIndex((page) => page.path === currParent);
		let prevParentIdx = pages.findIndex((page) => page.path === prevParent);

		if (to === '/') {
			currParentIdx = prevParentIdx;
			currDepth = 1;
		}
		if (from === '/') {
			prevParentIdx = currParentIdx;
			prevDepth = 1;
		}

		let xDiff = currParentIdx - prevParentIdx;
		let yDiff = currDepth - prevDepth;

		if (prefersReducedMotion.current) {
			xDiff = 0;
			yDiff = 0;
		}

		return { xDiff, yDiff };
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		const from = navigation.from?.url.pathname || '/';
		const to = navigation.to?.url.pathname || '/';

		const { xDiff, yDiff } = calculateTransitionOffsets(from, to);

		// Set CSS custom properties for the transition
		document.documentElement.style.setProperty('--transition-x', `${xDiff * 100}vw`);
		document.documentElement.style.setProperty('--transition-y', `${yDiff * 100}vh`);

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<PageHead
	title={page.error ? page.status : page.data.meta.title}
	description={page.error ? page.error.message : page.data.meta.description}
	type={page.data.meta.type}
	image={page.data.meta.image}
/>

<header class:home={page.url.pathname === '/'} data-sveltekit-noscroll>
	<div class="row">
		<a class="pfp" href="/" aria-label="homepage"><Logo --width="2rem" --height="2rem" /></a>
		<a href="/"><h1>refact0r</h1></a>
	</div>
	<nav>
		{#each pages as { name, path }}
			<a class="nav" href={path}>
				<span class="arrow">-></span><span class="slash">/</span>{name}
			</a>
		{/each}
	</nav>
</header>
<div class="container" data-sveltekit-noscroll>
	{@render children?.()}
</div>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 4rem;
		height: 5rem;
		overflow: hidden;
		transition: transform 0.1s ease;
		transform: translateY(0);
		flex-shrink: 0;

		&.home {
			transform: translateY(-70%);
		}

		.row {
			display: flex;
			align-items: center;
			gap: 1.5rem;

			.pfp {
				display: flex;
			}

			h1 {
				font-size: 1.375rem;
				color: var(--txt);
				margin: 0;
			}
		}

		nav {
			display: flex;
			gap: 2.5rem;

			a {
				font-size: 1.375rem;
				font-family: 'Space Mono', monospace;
			}
		}
	}

	.container {
		height: 100%;
		view-transition-name: content;
	}

	/* View Transitions API */
	@supports (view-transition-name: none) {
		::view-transition-old(content),
		::view-transition-new(content) {
			animation-duration: 200ms;
			animation-timing-function: linear;
			mix-blend-mode: normal;
		}

		::view-transition-old(content) {
			animation-name: slide-out;
		}

		::view-transition-new(content) {
			animation-name: slide-in;
		}

		::view-transition-group(root) {
			overflow: visible;
		}

		@keyframes slide-out {
			to {
				transform: translate(
					calc(var(--transition-x, 0vh) * -1),
					calc(var(--transition-y, 0vh) * -1)
				);
			}
		}

		@keyframes slide-in {
			from {
				transform: translate(
					calc(var(--transition-x, 0vh) * 2),
					calc(var(--transition-y, 0vh) * 2)
				);
			}
		}
	}

	@media (max-width: 850px) {
		header {
			padding: 0 1.5rem;
			gap: 1.5rem;

			nav {
				gap: 1.5rem;
			}
		}
	}

	@media (max-width: 700px) {
		header nav {
			display: none;
		}
	}
</style>
