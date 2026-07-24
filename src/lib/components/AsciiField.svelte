<script>
	import { onMount } from 'svelte';

	const CONFIG = {
		maxPixelRatio: 2,
		grid: {
			cellWidth: 17,
			cellHeight: 21,
			fontSize: 11
		},
		frameInterval: {
			idle: 50,
			burst: 10
		},
		driftSpeed: 0.00006,
		pointer: {
			initialX: 0.5,
			initialY: 0.48,
			easing: 0.12,
			radius: 0.3,
			strength: 0.6
		},
		burst: {
			duration: 3100,
			width: 0.15,
			widthGrowth: 0.025,
			fadeStart: 0.78,
			fadeDuration: 0.22
		},
		color: {
			hue: 220,
			saturation: 14,
			baseLightness: 43,
			burstLightness: 27,
			baseAlpha: 0.25,
			burstAlpha: 0.8
		}
	};

	function clamp01(value) {
		return Math.max(0, Math.min(1, value));
	}

	function hash(column, row) {
		const value = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
		return value - Math.floor(value);
	}

	let { burst = null } = $props();
	let canvas;
	let triggerBurst;
	let previousBurstId = null;

	$effect(() => {
		if (burst && burst.id !== previousBurstId) {
			previousBurstId = burst.id;
			triggerBurst?.(burst);
		}
	});

	onMount(() => {
		const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
		if (!context) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const pointer = { x: CONFIG.pointer.initialX, y: CONFIG.pointer.initialY };
		const pointerTarget = { ...pointer };
		let animationFrame;
		let previousFrame = 0;
		let activeBurst = null;
		let pixelRatio = 1;

		triggerBurst = (nextBurst) => {
			if (reducedMotion.matches) return;
			const now = performance.now();
			activeBurst = {
				x: nextBurst.x,
				y: nextBurst.y,
				startedAt: now
			};
			draw(now);
			previousFrame = now;
		};

		function resize() {
			pixelRatio = Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio);
			const width = Math.round(canvas.clientWidth * pixelRatio);
			const height = Math.round(canvas.clientHeight * pixelRatio);

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}
		}

		function updatePointer(event) {
			pointerTarget.x = event.clientX / window.innerWidth;
			pointerTarget.y = event.clientY / window.innerHeight;
		}

		function draw(timestamp = 0) {
			const width = canvas.width;
			const height = canvas.height;
			if (!width || !height) return;

			const time = reducedMotion.matches ? 0 : timestamp * CONFIG.driftSpeed;
			const cellWidth = CONFIG.grid.cellWidth * pixelRatio;
			const cellHeight = CONFIG.grid.cellHeight * pixelRatio;
			const startX = cellWidth;
			const aspect = width / height;
			const burstProgress = activeBurst
				? (timestamp - activeBurst.startedAt) / CONFIG.burst.duration
				: 2;
			const burstRadius = Math.max(0, burstProgress) * Math.sqrt(aspect * aspect + 1);
			const burstWidth = CONFIG.burst.width + Math.max(0, burstProgress) * CONFIG.burst.widthGrowth;
			const burstLife = clamp01(
				1 - (burstProgress - CONFIG.burst.fadeStart) / CONFIG.burst.fadeDuration
			);

			if (burstProgress > 1) activeBurst = null;

			pointer.x += (pointerTarget.x - pointer.x) * CONFIG.pointer.easing;
			pointer.y += (pointerTarget.y - pointer.y) * CONFIG.pointer.easing;

			context.clearRect(0, 0, width, height);
			context.font = `${CONFIG.grid.fontSize * pixelRatio}px "Space Mono", monospace`;
			context.textAlign = 'center';
			context.textBaseline = 'middle';

			for (let y = cellHeight; y < height; y += cellHeight) {
				for (let x = startX; x < width; x += cellWidth) {
					const column = Math.round(x / cellWidth);
					const row = Math.round(y / cellHeight);
					const normalizedX = x / width;
					const normalizedY = y / height;
					const dx = normalizedX - pointer.x;
					const dy = normalizedY - pointer.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const influence = clamp01(1 - distance / CONFIG.pointer.radius);
					const disturbance = influence * influence * CONFIG.pointer.strength;

					const signal =
						Math.sin(normalizedX * 11.0 + time + normalizedY * 2.4) +
						0.62 * Math.sin(normalizedY * 15.0 - time * 0.7) +
						0.28 * Math.sin((normalizedX - normalizedY) * 24.0 + time * 0.45) +
						disturbance;

					const contour = Math.abs(Math.sin(signal * 2.45));
					const random = hash(column, row);
					let burstWave = 0;

					if (activeBurst) {
						const burstX = (normalizedX - activeBurst.x) * aspect;
						const burstY = normalizedY - activeBurst.y;
						const burstDistance = Math.sqrt(burstX * burstX + burstY * burstY);
						const fieldWarp =
							signal * 0.011 + Math.sin(normalizedX * 19.0 - normalizedY * 13.0) * 0.008;
						const distanceFromWave = (burstDistance + fieldWarp - burstRadius) / burstWidth;
						const waveFront = Math.exp(-distanceFromWave * distanceFromWave * 1.8) * burstLife;
						const patternVisibility = clamp01((contour - 0.62 - random * 0.14) / 0.24);
						burstWave = waveFront * (0.16 + patternVisibility * 0.84);
					}

					const baseThreshold = 0.925 + random * 0.045;
					const baseVisibility = clamp01((contour - baseThreshold + 0.018) / 0.036);
					if (baseVisibility < 0.01 && burstWave < 0.01) continue;

					const horizontalFade =
						Math.min(1, normalizedX / 0.035) * Math.min(1, (1 - normalizedX) / 0.035);
					const edgeFade =
						Math.min(1, normalizedY / 0.045) * Math.min(1, (1 - normalizedY) / 0.045);
					const baseAlpha =
						(CONFIG.color.baseAlpha + Math.max(0, contour - 0.9) * 0.8) * baseVisibility;
					const alpha =
						(baseAlpha + burstWave * CONFIG.color.burstAlpha) * horizontalFade * edgeFade;
					const burstMix = clamp01(burstWave * 1.8);
					const lightness = CONFIG.color.baseLightness + burstMix * CONFIG.color.burstLightness;

					context.fillStyle = `hsla(${CONFIG.color.hue}, ${CONFIG.color.saturation}%, ${lightness}%, ${alpha})`;
					context.fillText(random > 0.9 ? '+' : random > 0.62 ? ':' : '.', x, y);
				}
			}
		}

		function render(timestamp) {
			const frameInterval = activeBurst ? CONFIG.frameInterval.burst : CONFIG.frameInterval.idle;
			if (timestamp - previousFrame > frameInterval || reducedMotion.matches) {
				draw(timestamp);
				previousFrame = timestamp;
			}

			if (!reducedMotion.matches) {
				animationFrame = requestAnimationFrame(render);
			}
		}

		function handleResize() {
			resize();
			draw(performance.now());
		}

		function handleMotionChange() {
			cancelAnimationFrame(animationFrame);
			if (reducedMotion.matches) activeBurst = null;
			draw(performance.now());
			if (!reducedMotion.matches) animationFrame = requestAnimationFrame(render);
		}

		window.addEventListener('pointermove', updatePointer, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });
		reducedMotion.addEventListener('change', handleMotionChange);
		resize();
		draw(performance.now());
		if (!reducedMotion.matches) animationFrame = requestAnimationFrame(render);

		return () => {
			triggerBurst = undefined;
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('pointermove', updatePointer);
			window.removeEventListener('resize', handleResize);
			reducedMotion.removeEventListener('change', handleMotionChange);
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		pointer-events: none;
		opacity: 1;
	}
</style>
