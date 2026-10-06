<script>
	import { onMount } from 'svelte';
	import field from '$lib/assets/logo-field.webp?inline';

	// The last animation to finish in each sequence: the lower trap pooling.
	const FINAL_ANIMATION_NAME = 'logo-pool';
	const COMPLETION_FALLBACK_MS = 2700;

	let { skipInitialAnimation = false, onAnimationComplete } = $props();

	const id = $props.id();

	let svg;
	let initialAnimationFinished = $state(false);
	let initialLoadComplete = $derived(skipInitialAnimation || initialAnimationFinished);
	let isHovering = $state(false);
	let isAnimating = $state(false);
	let completionFallback;
	let restartTimeout;

	onMount(() => {
		if (!skipInitialAnimation) {
			// The animation event is authoritative; this only covers browsers
			// that suppress it before the component finishes mounting.
			completionFallback = setTimeout(completeInitialAnimation, COMPLETION_FALLBACK_MS);
		}

		return () => {
			clearTimeout(completionFallback);
			clearTimeout(restartTimeout);
		};
	});

	function completeInitialAnimation() {
		if (initialLoadComplete) return;
		initialAnimationFinished = true;
		clearTimeout(completionFallback);
		notifyAnimationComplete();
	}

	function notifyAnimationComplete() {
		if (!onAnimationComplete) return;

		const bounds = svg.getBoundingClientRect();
		onAnimationComplete({
			x: (bounds.left + bounds.width / 2) / window.innerWidth,
			y: (bounds.top + bounds.height / 2) / window.innerHeight
		});
	}

	function handleMouseEnter() {
		// Only trigger if initial load is done
		if (!initialLoadComplete) return;
		isHovering = true;
		if (!isAnimating) {
			isAnimating = true;
		}
	}

	function handleMouseLeave() {
		if (!initialLoadComplete) return;
		isHovering = false;
	}

	function handleAnimationEnd(event) {
		if (event.animationName !== FINAL_ANIMATION_NAME) return;
		if (!event.target.classList.contains('trap-low')) return;

		if (!initialLoadComplete) {
			completeInitialAnimation();
			return;
		}

		notifyAnimationComplete();

		// After animation completes, check if still hovering
		if (isHovering) {
			// Restart animation by toggling the class
			isAnimating = false;
			clearTimeout(restartTimeout);
			restartTimeout = setTimeout(() => {
				isAnimating = true;
			}, 0);
		} else {
			isAnimating = false;
		}
	}
</script>

<!--
	The mark written as 文 in stroke order: dot, bar, the long / from top-right, then the \ from
	under the bar. Where a stroke crosses one that is already down, ink pools into the corners (the
	traps). On hover the same hand lifts the strokes off in the same order and writes them again.
-->
<svg
	bind:this={svg}
	viewBox="180 203.5 640 640"
	xmlns="http://www.w3.org/2000/svg"
	style="cursor: {initialLoadComplete ? 'pointer' : 'default'};"
	role="img"
	aria-label="Animated logo"
	class:writing={!initialLoadComplete}
	class:rewriting={isAnimating}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onanimationend={handleAnimationEnd}
>
	<defs>
		<!-- One colour per stroke, blended through the knot -->
		<pattern id="{id}-field" width="1000" height="1000" patternUnits="userSpaceOnUse">
			<image href={field} width="1000" height="1000" preserveAspectRatio="none" />
		</pattern>
	</defs>
	<g fill="none" stroke="url(#{id}-field)" stroke-width="36">
		<path class="stroke dot" pathLength="1" d="M346.3,327.78L385.68,396" />
		<path class="stroke bar" pathLength="1" d="M212,453L788,453" />
		<path
			class="trap trap-high"
			fill="url(#{id}-field)"
			stroke="none"
			d="M679.06,471C596.12,471 589.64,474.74 548.17,546.57L516.99,528.57C545.58,479.06 540.92,471 483.76,471L483.76,435C566.7,435 573.17,431.26 614.64,359.43L645.82,377.43C617.24,426.94 621.89,435 679.06,435Z"
		/>
		<path class="stroke slash" pathLength="1" d="M705.7,237.71L375.7,809.29" />
		<path
			class="trap trap-low"
			fill="url(#{id}-field)"
			stroke="none"
			d="M533.24,687.57C504.65,638.06 495.35,638.06 466.76,687.57L435.59,669.57C477.06,597.74 477.07,590.29 435.91,519L467.09,501C495.39,550.02 504.65,549.94 533.24,500.43L564.41,518.43C522.94,590.26 522.94,597.74 564.41,669.57Z"
		/>
		<path class="stroke back" pathLength="1" d="M451.5,510L572.3,719.22" />
	</g>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;

		/* a quick attack and a soft landing for the pen */
		--pen: cubic-bezier(0.25, 0.5, 0.4, 1);
		--lift: cubic-bezier(0.45, 0, 0.55, 1);
		--settle: cubic-bezier(0.2, 0.7, 0.3, 1);
	}

	@keyframes -global-logo-write {
		from {
			stroke-dashoffset: 1.02;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes -global-logo-lift {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: -1.02;
		}
	}

	/* pen pressure: a stroke lands heavy and the ink settles to its weight */
	@keyframes -global-logo-press {
		from {
			stroke-width: 58;
		}
		to {
			stroke-width: 36;
		}
	}

	@keyframes -global-logo-pool {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}

	@keyframes -global-logo-drain {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(0);
		}
	}

	.stroke {
		stroke-dasharray: 1 2;
	}

	/* each trap grows out of its own crossing */
	.trap-high {
		transform-origin: 581.4px 453px;
	}

	.trap-low {
		transform-origin: 500px 594px;
	}

	/*
		Initial page load: written once, 1.55s. The hand doesn't stop between strokes: a quick tap
		for the dot, straight into the bar, a beat before the long /, then the \ before the / has
		landed.
	*/
	.writing {
		.dot {
			animation:
				logo-write 0.15s var(--pen) 0.05s both,
				logo-press 0.3s var(--settle) 0.05s;
		}

		.bar {
			animation:
				logo-write 0.36s var(--pen) 0.17s both,
				logo-press 0.55s var(--settle) 0.17s;
		}

		.slash {
			animation:
				logo-write 0.42s var(--pen) 0.56s both,
				logo-press 0.62s var(--settle) 0.56s;
		}

		.back {
			animation:
				logo-write 0.28s var(--pen) 0.86s both,
				logo-press 0.45s var(--settle) 0.86s;
		}

		/* a trap starts to fill as the pen comes through the crossing */
		.trap-high {
			animation: logo-pool 0.6s var(--settle) 0.69s both;
		}

		.trap-low {
			animation: logo-pool 0.6s var(--settle) 0.95s both;
		}
	}

	/* Hover: lifted off in stroke order, then written again, 2.95s. Runs exactly once */
	.rewriting {
		.dot {
			animation:
				logo-lift 0.14s var(--lift) 0.17s forwards,
				logo-write 0.15s var(--pen) 1.43s forwards,
				logo-press 0.3s var(--settle) 1.43s;
		}

		.bar {
			animation:
				logo-lift 0.32s var(--lift) 0.36s forwards,
				logo-write 0.36s var(--pen) 1.55s forwards,
				logo-press 0.55s var(--settle) 1.55s;
		}

		.slash {
			animation:
				logo-lift 0.36s var(--lift) 0.73s forwards,
				logo-write 0.42s var(--pen) 1.94s forwards,
				logo-press 0.62s var(--settle) 1.94s;
		}

		.back {
			animation:
				logo-lift 0.22s var(--lift) 1.12s forwards,
				logo-write 0.28s var(--pen) 2.24s forwards,
				logo-press 0.45s var(--settle) 2.24s;
		}

		/* each trap lets go before the tail of its first stroke gets there */
		.trap-high {
			animation:
				logo-drain 0.41s var(--lift) forwards,
				logo-pool 0.6s var(--settle) 2.07s forwards;
		}

		.trap-low {
			animation:
				logo-drain 0.37s var(--lift) 0.48s forwards,
				logo-pool 0.6s var(--settle) 2.33s forwards;
		}
	}
</style>
