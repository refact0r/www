<script>
	import { onMount } from 'svelte';

	// Runs on the rendered colour field for the length of each sequence; the ink itself is inside a mask.
	const FINAL_ANIMATION_NAME = 'logo-clock';
	const COMPLETION_FALLBACK_MS = 3000;
	const LOOP_PAUSE_MS = 500;

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
		// Mid-pause the loop is already about to go again; let it finish resting
		if (!isAnimating && !restartTimeout) {
			isAnimating = true;
		}
	}

	function handleMouseLeave() {
		if (!initialLoadComplete) return;
		isHovering = false;
	}

	function handleAnimationEnd(event) {
		if (event.animationName !== FINAL_ANIMATION_NAME) return;

		if (!initialLoadComplete) {
			completeInitialAnimation();
			return;
		}

		notifyAnimationComplete();

		// Rest on the finished mark, then go again if still hovering
		isAnimating = false;
		clearTimeout(restartTimeout);
		restartTimeout = setTimeout(() => {
			restartTimeout = undefined;
			if (isHovering) isAnimating = true;
		}, LOOP_PAUSE_MS);
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
		<!-- The ink: white shapes that reveal the colour field. The field itself never moves -->
		<mask id="{id}-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
			<g fill="none" stroke="#fff" stroke-width="36">
				<path class="stroke dot" pathLength="1" d="M346.3,327.78L385.68,396" />
				<path class="stroke bar" pathLength="1" d="M212,453L788,453" />
				<path class="stroke slash" pathLength="1" d="M705.7,237.71L375.7,809.29" />
				<path class="stroke back" pathLength="1" d="M451.5,510L572.3,719.22" />
			</g>
			<g fill="#fff">
				<path
					class="trap trap-high"
					d="M679.06,471C596.12,471 589.64,474.74 548.17,546.57L516.99,528.57C545.58,479.06 540.92,471 483.76,471L483.76,435C566.7,435 573.17,431.26 614.64,359.43L645.82,377.43C617.24,426.94 621.89,435 679.06,435Z"
				/>
				<path
					class="trap trap-low"
					d="M533.24,687.57C504.65,638.06 495.35,638.06 466.76,687.57L435.59,669.57C477.06,597.74 477.07,590.29 435.91,519L467.09,501C495.39,550.02 504.65,549.94 533.24,500.43L564.41,518.43C522.94,590.26 522.94,597.74 564.41,669.57Z"
				/>
			</g>
		</mask>
		<!-- the / in two halves, split between its two crossings: above (the bar) and below (the \) -->
		<linearGradient
			id="{id}-upper"
			gradientUnits="userSpaceOnUse"
			x1="555.7"
			y1="497.5"
			x2="515.7"
			y2="566.8"
		>
			<stop offset="0" />
			<stop offset="1" stop-opacity="0" />
		</linearGradient>
		<linearGradient
			id="{id}-lower"
			gradientUnits="userSpaceOnUse"
			x1="555.7"
			y1="497.5"
			x2="515.7"
			y2="566.8"
		>
			<stop offset="0" stop-opacity="0" />
			<stop offset="1" />
		</linearGradient>
		<filter id="{id}-blend" filterUnits="userSpaceOnUse" x="136" y="163" width="728" height="721">
			<feGaussianBlur stdDeviation="24" />
		</filter>
	</defs>
	<!--
		The colour field: every point takes the colour of the stroke it is nearest to, so each
		region widens away from the crossings. Blurred so the colours blend through the knot.
	-->
	<g class="field" mask="url(#{id}-ink)">
		<g filter="url(#{id}-blend)">
			<rect class="purple" width="1000" height="1000" />
			<path
				class="pink"
				d="M299,-459L179,-251L182,-240L413,161L493,216L499,229L500,239L501,314L581,452L567,462L503,499L500,507L501,591L492,594L347,594L335,596L-266,942L764,1537L984,1156L980,1144L901,1006L500,766L499,599L506,594L650,594L660,590L582,452L1230,78Z"
			/>
			<path
				class="blue"
				d="M-100,846L332,596L340,589L364,552L388,530L412,513L436,500L468,489L484,490L500,499L580,453L660,589L668,596L732,634L740,644L748,741L980,1143L988,1153L1100,1153L1100,154L588,450L580,451L500,313L476,351L452,374L436,386L396,408L372,416L356,417L284,376L268,364L260,-103L180,-242L172,-247L-100,-247Z"
			/>
		</g>
	</g>
	<!--
		While it is being written, a stroke is its own flat colour: solid copies are drawn over the
		field in step with the ink, each new stroke on top of the ones before it. Once a stroke has
		come through a crossing, the copies around that crossing fade out and let the blend in.
	-->
	<g fill="none" stroke-width="36">
		<!-- around the upper crossing: the bar, then the / over it -->
		<g class="solid solid-high">
			<path class="stroke bar" pathLength="1" d="M212,453L788,453" />
			<path
				class="stroke slash"
				stroke="url(#{id}-upper)"
				pathLength="1"
				d="M705.7,237.71L375.7,809.29"
			/>
		</g>
		<!-- around the lower crossing: the /, then the \ over it -->
		<g class="solid solid-low">
			<path
				class="stroke slash"
				stroke="url(#{id}-lower)"
				pathLength="1"
				d="M705.7,237.71L375.7,809.29"
			/>
			<path class="stroke back" pathLength="1" d="M451.5,510L572.3,719.22" />
		</g>
	</g>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;

		/* where on the timeline a sequence starts */
		--t: 0s;

		/* a quick attack and a soft landing for the pen */
		--pen: cubic-bezier(0.25, 0.5, 0.4, 1);
		/* a stroke leaving eases in and out evenly, so its last piece does not linger */
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

	/* the dash pattern repeats every 3, so 3 is the resting 0: the offset never goes negative */
	@keyframes -global-logo-lift {
		from {
			stroke-dashoffset: 3;
		}
		to {
			stroke-dashoffset: 1.98;
		}
	}

	@keyframes -global-logo-blend {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes -global-logo-clock {
		from,
		to {
			opacity: 1;
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

	.blue {
		fill: var(--blue);
	}

	.pink {
		fill: var(--pink);
	}

	.purple {
		fill: var(--purple);
	}

	.stroke {
		stroke-dasharray: 1 2;
	}

	.solid {
		opacity: 0;
	}

	.solid .bar {
		stroke: var(--blue);
	}

	.solid .back {
		stroke: var(--purple);
	}

	stop {
		stop-color: var(--pink);
	}

	/* each trap grows out of its own crossing */
	.trap-high {
		transform-origin: 581.4px 453px;
	}

	.trap-low {
		transform-origin: 500px 594px;
	}

	/*
		One timeline, 3.84s: the strokes lift off in stroke order (0 to 1.6s), then are written again.
		Hover plays all of it, exactly once. The initial page load starts 1.61s in, with everything
		already lifted off, so it is written once in 2.23s.
	*/
	.writing {
		--t: -1.61s;
	}

	.writing,
	.rewriting {
		.field {
			animation: logo-clock 3.84s var(--t);
		}

		/*
			Leaving: a trap is gone, and its crossing back to flat colour, exactly as the tail of the
			first stroke to leave gets there (the bar at 0.5s, the / at 1.03s). Played in reverse, so
			most of the change comes just before.
			Arriving: a trap starts to fill, and its crossing to blend, as the pen comes through.
		*/
		.solid-high {
			animation:
				logo-blend 0.44s var(--settle) calc(var(--t) + 0.06s) reverse forwards,
				logo-blend 0.5s var(--settle) calc(var(--t) + 2.71s) forwards;
		}

		.solid-low {
			animation:
				logo-blend 0.44s var(--settle) calc(var(--t) + 0.59s) reverse forwards,
				logo-blend 0.5s var(--settle) calc(var(--t) + 3.24s) forwards;
		}

		.trap-high {
			animation:
				logo-pool 0.44s var(--settle) calc(var(--t) + 0.06s) reverse forwards,
				logo-pool 0.6s var(--settle) calc(var(--t) + 2.71s) forwards;
		}

		.trap-low {
			animation:
				logo-pool 0.44s var(--settle) calc(var(--t) + 0.59s) reverse forwards,
				logo-pool 0.6s var(--settle) calc(var(--t) + 3.24s) forwards;
		}

		.dot {
			animation:
				logo-lift 0.19s var(--lift) var(--t) forwards,
				logo-write 0.17s var(--pen) calc(var(--t) + 1.69s) forwards,
				logo-press 0.3s var(--settle) calc(var(--t) + 1.69s);
		}

		.bar {
			animation:
				logo-lift 0.43s var(--lift) calc(var(--t) + 0.25s) forwards,
				logo-write 0.39s var(--pen) calc(var(--t) + 2s) forwards,
				logo-press 0.58s var(--settle) calc(var(--t) + 2s);
		}

		.slash {
			animation:
				logo-lift 0.49s var(--lift) calc(var(--t) + 0.75s) forwards,
				logo-write 0.44s var(--pen) calc(var(--t) + 2.53s) forwards,
				logo-press 0.65s var(--settle) calc(var(--t) + 2.53s);
		}

		.back {
			animation:
				logo-lift 0.3s var(--lift) calc(var(--t) + 1.3s) forwards,
				logo-write 0.29s var(--pen) calc(var(--t) + 3.11s) forwards,
				logo-press 0.45s var(--settle) calc(var(--t) + 3.11s);
		}
	}
</style>
