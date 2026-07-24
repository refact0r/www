<script>
	import { onMount } from 'svelte';

	const CONFIG = {
		maxPixelRatio: 2,
		grid: {
			cellWidth: 14,
			cellHeight: 18,
			fontSize: 12
		},
		pattern: {
			primary: {
				xFrequency: 11,
				yFrequency: 2.4,
				amplitude: 1,
				speed: 1
			},
			vertical: {
				frequency: 15,
				amplitude: 0.62,
				speed: -0.7
			},
			diagonal: {
				frequency: 24,
				amplitude: 0.28,
				speed: 0.45
			},
			warp: {
				scale: 4,
				strength: 0.4,
				detailScale: 2.8,
				detailStrength: 0.16,
				speed: 0.12
			},
			contourFrequency: 2.6,
			threshold: 0.88,
			thresholdVariation: 0.1,
			visibilityOffset: 0.025,
			visibilityRange: 0.05
		},
		frameInterval: {
			idle: 50,
			burst: 10
		},
		driftSpeed: 0.0001,
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
			saturation: 15,
			baseLightness: 50,
			burstLightness: 25,
			baseAlpha: 0.35,
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

	function smoothstep(value) {
		return value * value * (3 - 2 * value);
	}

	function valueNoise(x, y) {
		const column = Math.floor(x);
		const row = Math.floor(y);
		const offsetX = smoothstep(x - column);
		const offsetY = smoothstep(y - row);
		const top = hash(column, row) * (1 - offsetX) + hash(column + 1, row) * offsetX;
		const bottom = hash(column, row + 1) * (1 - offsetX) + hash(column + 1, row + 1) * offsetX;

		return top * (1 - offsetY) + bottom * offsetY;
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

					const { primary, vertical, diagonal } = CONFIG.pattern;
					const { warp } = CONFIG.pattern;
					const warpX = normalizedX * warp.scale * aspect + time * warp.speed;
					const warpY = normalizedY * warp.scale - time * warp.speed * 0.7;
					const fieldWarp =
						(valueNoise(warpX, warpY) - 0.5) * 2 * warp.strength +
						(valueNoise(warpX * warp.detailScale + 17, warpY * warp.detailScale + 31) - 0.5) *
							2 *
							warp.detailStrength;
					const signal =
						primary.amplitude *
							Math.sin(
								normalizedX * primary.xFrequency +
									time * primary.speed +
									normalizedY * primary.yFrequency
							) +
						vertical.amplitude *
							Math.sin(normalizedY * vertical.frequency + time * vertical.speed) +
						diagonal.amplitude *
							Math.sin((normalizedX - normalizedY) * diagonal.frequency + time * diagonal.speed) +
						fieldWarp +
						disturbance;

					const contour = Math.abs(Math.sin(signal * CONFIG.pattern.contourFrequency));
					const random = hash(column, row);
					let burstWave = 0;

					if (activeBurst) {
						const burstX = (normalizedX - activeBurst.x) * aspect;
						const burstY = normalizedY - activeBurst.y;
						const burstDistance = Math.sqrt(burstX * burstX + burstY * burstY);
						const burstWarp =
							signal * 0.011 + Math.sin(normalizedX * 19.0 - normalizedY * 13.0) * 0.008;
						const distanceFromWave = (burstDistance + burstWarp - burstRadius) / burstWidth;
						const waveFront = Math.exp(-distanceFromWave * distanceFromWave * 1.8) * burstLife;
						const patternVisibility = clamp01((contour - 0.62 - random * 0.14) / 0.24);
						burstWave = waveFront * (0.16 + patternVisibility * 0.84);
					}

					const baseThreshold =
						CONFIG.pattern.threshold + random * CONFIG.pattern.thresholdVariation;
					const baseVisibility = clamp01(
						(contour - baseThreshold + CONFIG.pattern.visibilityOffset) /
							CONFIG.pattern.visibilityRange
					);
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
