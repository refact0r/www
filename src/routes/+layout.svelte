<script>
	import '../app.css';
	import '$lib/assets/fonts/space-mono.css';
	import '$lib/assets/fonts/space-grotesk.css';
	import { page } from '$app/state';
	import LogoAnimated from '$lib/components/LogoAnimated.svelte';
	import PageHead from '$lib/components/PageHead.svelte';
	import { fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { beforeNavigate } from '$app/navigation';

	let { children } = $props();

	const pages = [
		{ name: 'about', path: '/about' },
		{ name: 'projects', path: '/projects' },
		{ name: 'blog', path: '/blog' },
		{ name: 'photos', path: '/photos' },
		{ name: 'contact', path: '/contact' }
	];

	let currPage = $state(page.url.pathname);
	let prevPage = $state('');

	beforeNavigate((navigation) => {
		if (navigation.to?.url.pathname) {
			prevPage = currPage;
			currPage = navigation.to.url.pathname;
		}
		console.log(currPage, prevPage);
	});

	function transition(path, out) {
		const cleanPath = path.replace(/\/$/, '');
		const cleanPrevPath = prevPage.replace(/\/$/, '');

		let currDepth = cleanPath.split('/').length;
		let prevDepth = cleanPrevPath.split('/').length;

		const currParent = '/' + cleanPath.split('/')[1];
		const prevParent = '/' + cleanPrevPath.split('/')[1];

		let currParentIdx = pages.findIndex((page) => page.path === currParent);
		let prevParentIdx = pages.findIndex((page) => page.path === prevParent);

		if (path === '/') {
			currParentIdx = prevParentIdx;
			currDepth = 1;
		}
		if (prevPage === '/') {
			prevParentIdx = currParentIdx;
			prevDepth = 1;
		}

		let xDiff = currParentIdx - prevParentIdx;
		let yDiff = currDepth - prevDepth;

		if (out) {
			xDiff *= -1;
			yDiff *= -1;
		}
		if (prefersReducedMotion.current) {
			xDiff *= 0;
			yDiff *= 0;
		}

		return {
			duration: 150,
			delay: out ? 0 : 50,
			x: `${xDiff * 20}vh`,
			y: `${yDiff * 20}vh`
		};
	}
</script>

<PageHead
	title={page.error ? page.status : page.data.meta.title}
	description={page.error ? page.error.message : page.data.meta.description}
	type={page.data.meta.type}
	image={page.data.meta.image}
/>

<header class:home={page.url.pathname === '/'} data-sveltekit-noscroll>
	<div class="row">
		<a class="pfp" href="/" aria-label="homepage">
			<LogoAnimated skipInitialAnimation={true} />
		</a>
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
	{#key page.url.pathname}
		<div
			class="transition"
			in:fly={transition(page.url.pathname, false)}
			out:fly={transition(page.url.pathname, true)}
		>
			{@render children?.()}
		</div>
	{/key}
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
				width: 2rem;
				height: 2rem;
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
		display: grid;
	}

	.transition {
		grid-column-start: 1;
		grid-column-end: 2;
		grid-row-start: 1;
		grid-row-end: 2;
		min-width: 0;
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
