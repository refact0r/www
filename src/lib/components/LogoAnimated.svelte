<script>
	import { onMount } from 'svelte';

	const INITIAL_ANIMATION_NAME = 'initial-load-660';
	const HOVER_ANIMATION_NAME = 'hover-loop-660';
	const COMPLETION_FALLBACK_MS = 3500;

	let { skipInitialAnimation = false, onAnimationComplete } = $props();

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
		if (!initialLoadComplete) {
			if (event.animationName === INITIAL_ANIMATION_NAME) completeInitialAnimation();
			return;
		}

		if (event.animationName !== HOVER_ANIMATION_NAME) return;
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

<svg
	bind:this={svg}
	viewBox="0 0 300 300"
	xmlns="http://www.w3.org/2000/svg"
	style="cursor: {initialLoadComplete ? 'pointer' : 'default'};"
	role="img"
	aria-label="Animated logo"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<defs>
		<style>
			/* Initial page load animations - 3s */
			@keyframes initial-load-180 {
				0% {
					transform: rotate(0deg) scaleX(0);
				}
				23.33% {
					transform: rotate(0deg) scaleX(1);
				}
				100% {
					transform: rotate(180deg) scaleX(1);
				}
			}

			@keyframes initial-load-420 {
				0% {
					transform: rotate(0deg) scaleX(0);
				}
				23.33% {
					transform: rotate(0deg) scaleX(1);
				}
				100% {
					transform: rotate(420deg) scaleX(1);
				}
			}

			@keyframes initial-load-660 {
				0% {
					transform: rotate(0deg) scaleX(0);
				}
				23.33% {
					transform: rotate(0deg) scaleX(1);
				}
				100% {
					transform: rotate(660deg) scaleX(1);
				}
			}

			/* Hover loop animations - 3.6s active cycle */
			@keyframes hover-loop-180 {
				0% {
					transform: rotate(180deg) scaleX(1);
				}
				19.444% {
					transform: rotate(180deg) scaleX(0);
				}
				20% {
					transform: rotate(0deg) scaleX(0);
				}
				39.444% {
					transform: rotate(0deg) scaleX(1);
				}
				100% {
					transform: rotate(180deg) scaleX(1);
				}
			}

			@keyframes hover-loop-420 {
				0% {
					transform: rotate(420deg) scaleX(1);
				}
				19.444% {
					transform: rotate(420deg) scaleX(0);
				}
				20% {
					transform: rotate(0deg) scaleX(0);
				}
				39.444% {
					transform: rotate(0deg) scaleX(1);
				}
				100% {
					transform: rotate(420deg) scaleX(1);
				}
			}

			@keyframes hover-loop-660 {
				0% {
					transform: rotate(660deg) scaleX(1);
				}
				19.444% {
					transform: rotate(660deg) scaleX(0);
				}
				20% {
					transform: rotate(0deg) scaleX(0);
				}
				39.444% {
					transform: rotate(0deg) scaleX(1);
				}
				100% {
					transform: rotate(660deg) scaleX(1);
				}
			}

			.spinner-line1:not(.complete) {
				animation: initial-load-180 3s cubic-bezier(0.55, 0.06, 0.36, 1) forwards;
				transform-origin: 150px 150px;
			}

			.spinner-line2:not(.complete) {
				animation: initial-load-420 3s cubic-bezier(0.55, 0.06, 0.36, 1) forwards;
				transform-origin: 150px 150px;
			}

			.spinner-line3:not(.complete) {
				animation: initial-load-660 3s cubic-bezier(0.55, 0.06, 0.36, 1) forwards;
				transform-origin: 150px 150px;
			}

			/* Static logo state after initial load completes */
			.spinner-line1.complete:not(.animating) {
				animation: none;
				transform: rotate(180deg) scaleX(1);
				transform-origin: 150px 150px;
			}

			.spinner-line2.complete:not(.animating) {
				animation: none;
				transform: rotate(420deg) scaleX(1);
				transform-origin: 150px 150px;
			}

			.spinner-line3.complete:not(.animating) {
				animation: none;
				transform: rotate(660deg) scaleX(1);
				transform-origin: 150px 150px;
			}

			/* Hover animation - runs exactly once */
			.spinner-line1.animating {
				animation: hover-loop-180 3.6s cubic-bezier(0.55, 0.06, 0.36, 1) 1 forwards !important;
				transform-origin: 150px 150px;
			}

			.spinner-line2.animating {
				animation: hover-loop-420 3.6s cubic-bezier(0.55, 0.06, 0.36, 1) 1 forwards !important;
				transform-origin: 150px 150px;
			}

			.spinner-line3.animating {
				animation: hover-loop-660 3.6s cubic-bezier(0.55, 0.06, 0.36, 1) 1 forwards !important;
				transform-origin: 150px 150px;
			}
		</style>
	</defs>
	<!-- Line 3 (Purple) - bottom layer -->
	<g
		class="spinner-line3"
		class:complete={initialLoadComplete}
		class:animating={isAnimating}
		onanimationend={handleAnimationEnd}
	>
		<line
			x1="27.92"
			y1="150"
			x2="272.66"
			y2="150"
			stroke="rgb(189, 99, 238)"
			stroke-width="19.84"
			stroke-linecap="round"
		/>
	</g>
	<!-- Line 2 (Blue) - middle layer -->
	<g class="spinner-line2" class:complete={initialLoadComplete} class:animating={isAnimating}>
		<line
			x1="27.92"
			y1="150"
			x2="272.66"
			y2="150"
			stroke="rgb(98, 98, 238)"
			stroke-width="19.84"
			stroke-linecap="round"
		/>
	</g>
	<!-- Line 1 (Cyan/Teal) - top layer -->
	<g class="spinner-line1" class:complete={initialLoadComplete} class:animating={isAnimating}>
		<line
			x1="27.92"
			y1="150"
			x2="272.66"
			y2="150"
			stroke="rgb(38, 187, 217)"
			stroke-width="19.84"
			stroke-linecap="round"
		/>
	</g>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
