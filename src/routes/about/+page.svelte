<script>
	import GithubIcon from '~icons/ph/github-logo';
	import DiscordIcon from '~icons/ph/discord-logo';
	import KofiIcon from '~icons/ph/coffee';
	import XIcon from '~icons/ph/x-logo';

	let content = {
		tech: {
			languages: ['js', 'ts', 'python', 'java', 'dart', 'html', 'css'],
			frameworks: ['sveltekit', 'flutter', 'tensorflow'],
			tools: ['vscode', 'claude code', 'codex', 'figma', 'inkscape']
		}
	};
</script>

<main>
	<h1>about</h1>
	<p>
		hey there! i'm yifan, a cs student at uw in seattle. i also go by the name refact0r online. i'm
		interested in ai, web dev, design, among other topics. i love making things that are both
		functional and beautiful.
	</p>
	<h2>links</h2>
	<div class="links">
		<a href="https://github.com/refact0r" class="external icon">
			<GithubIcon /><span class="text">github</span><span class="arrow">/></span>
		</a>
		<a href="https://x.com/refact_r" class="external icon">
			<XIcon /><span class="text">x/twitter</span><span class="arrow">/></span>
		</a>
		<a href="https://discord.com/users/508863359777505290" class="external icon">
			<DiscordIcon /><span class="text">discord</span><span class="arrow">/></span>
		</a>
		<a href="https://ko-fi.com/refact0r" class="external icon">
			<KofiIcon /><span class="text">ko-fi</span><span class="arrow">/></span>
		</a>
	</div>
	<!-- <h2>languages</h2>
	{#each Object.keys(content.languages) as category}
		<div class="info">
			{category} <span class="sub">-></span>
			{#each content.languages[category] as item}
				{item}
				{#if item !== content.languages[category][content.languages[category].length - 1]}
					<span class="sub">/</span>&nbsp;
				{/if}
			{/each}
		</div>
	{/each} -->
	<h2>tech</h2>
	{#each Object.keys(content.tech) as category}
		<div class="info">
			{category} <span class="sub">-></span>
			{#each content.tech[category] as item}
				{item}
				{#if item !== content.tech[category][content.tech[category].length - 1]}
					<span class="sub">/</span>&nbsp;
				{/if}
			{/each}
		</div>
	{/each}
	<h2>colophon</h2>
	<a href="https://github.com/refact0r/personal" class="external"
		>github repo<span class="arrow">/></span></a
	>
	<a href="https://us.umami.is/share/HwZnyuHQ5Rqz3NWf/refact0r.dev" class="external"
		>analytics<span class="arrow">/></span></a
	>
	<div class="info">
		stack <span class="sub">-></span> sveltekit <span class="sub">/</span> mdsvex
		<span class="sub">/</span> vite <span class="sub">/</span> cloudflare pages
	</div>
	<div class="info">
		fonts <span class="sub">-></span> space mono <span class="sub">/</span>
		<span style="font-family: 'Space Grotesk Variable'">space grotesk</span>
	</div>
	<div class="info">
		<div class="colors">
			<div class="color" style="background: var(--bg); border: 2px solid var(--bg-2);">bg</div>
			<div class="color" style="background: var(--bg-2);">bg-2</div>
			<div class="color" style="background: var(--bg-3);">bg-3</div>
			<div class="color" style="background: var(--txt-3); color: var(--bg);">txt-3</div>
			<div class="color" style="background: var(--txt-2); color: var(--bg);">txt-2</div>
			<div class="color" style="background: var(--txt); color: var(--bg);">txt</div>
			<div class="color" style="background: var(--txt-0); color: var(--bg);">txt-0</div>
			<div class="color" style="background: var(--pink); color: var(--bg);">pink</div>
			<div class="color" style="background: var(--purple); color: var(--bg);">purple</div>
			<div class="color" style="background: var(--blue); color: var(--bg);">blue</div>
		</div>
	</div>
	<h2>friends</h2>
	<div class="info">
		<a class="card" href="/" rel="nofollow">
			<img src="/88x31.png" alt="refact0r" />
		</a>
		<a class="card" href="https://enochlau.com" rel="nofollow">
			<img src="https://enochlau.com/88x31.webp" alt="tnixc" />
		</a>
		<a class="card" href="https://www.sadan.zip" rel="nofollow">
			<img src="https://www.sadan.zip/assets/88x31.png" alt="sadan" />
		</a>
		<a class="card" href="https://vendicated.dev" rel="nofollow">
			<img src="https://vendicated.dev/_astro/me.D0UvsSv8.gif" alt="ven" />
		</a>
	</div>
	<div class="info">
		<a class="friend external" href="https://abhay7.dev/">abhay7<span class="arrow">/></span></a>
		<a class="friend external" href="https://yaoderek.github.io/"
			>yaoderek<span class="arrow">/></span></a
		>
		<a class="friend external" href="https://evanyfw.space/">evanyfw<span class="arrow">/></span></a
		>
	</div>
	<div class="info">
		<a class="webring previous" href="https://ctp-webr.ing/refact0r/previous">
			<span> &lt;- </span>&nbsp;
		</a><a class="webring home" href="https://ctp-webr.ing/">ctp webring</a><a
			class="webring next"
			href="https://ctp-webr.ing/refact0r/next"
		>
			&nbsp;<span> -> </span>
		</a>
	</div>
</main>

<style>
	main {
		width: 100%;
		max-width: 53rem;
		margin: 0 auto 10rem auto;
		padding: 0 1.5rem;
	}

	a {
		font-family: 'Space Mono', monospace;
		font-size: 1.25rem;
		margin: 0.5rem 0;
		display: block;
	}

	.info {
		font-size: 1.125rem;
		margin: 0.5rem 0;
		font-family: 'Space Mono', monospace;
	}

	.webring {
		display: inline-block;
		margin: 0;
		span {
			display: inline-block;
			transition: 0.2s;
		}
		&.home:hover {
			text-decoration: underline 2px;
		}
		&.next:hover span {
			transform: translateX(0.3em);
		}
		&.previous:hover span {
			transform: translateX(-0.3em);
		}
	}

	.friend {
		margin: 0 0.5rem 0 0;
		display: inline;
	}

	.card {
		margin: 0;
		display: inline;
		width: 88px;
		height: 31px;

		img {
			image-rendering: pixelated;
			width: 88px;
			height: 31px;
		}
	}

	.colors {
		display: inline-flex;
		margin-top: 0.5rem;
		flex-wrap: wrap;
	}

	.color {
		display: inline-block;
		padding: 0 0.5rem;
		width: 5rem;
		text-align: center;
		font-size: 1.125rem;
	}
</style>
