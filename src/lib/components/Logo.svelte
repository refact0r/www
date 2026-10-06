<script>
	import field from '$lib/assets/logo-field.webp?inline';

	const id = $props.id();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="180 203.5 640 640">
	<defs>
		<pattern id="{id}-field" width="1000" height="1000" patternUnits="userSpaceOnUse">
			<image href={field} width="1000" height="1000" preserveAspectRatio="none" />
		</pattern>
	</defs>
	<g fill="none" stroke="url(#{id}-field)" stroke-width="36">
		<path d="M346.3,327.78L385.68,396" />
		<path d="M212,453L788,453" />
		<path d="M705.7,237.71L375.7,809.29" />
		<path d="M451.5,510L572.3,719.22" />
	</g>
	<g fill="url(#{id}-field)">
		<path
			d="M679.06,471C596.12,471 589.64,474.74 548.17,546.57L516.99,528.57C545.58,479.06 540.92,471 483.76,471L483.76,435C566.7,435 573.17,431.26 614.64,359.43L645.82,377.43C617.24,426.94 621.89,435 679.06,435Z"
		/>
		<path
			d="M533.24,687.57C504.65,638.06 495.35,638.06 466.76,687.57L435.59,669.57C477.06,597.74 477.07,590.29 435.91,519L467.09,501C495.39,550.02 504.65,549.94 533.24,500.43L564.41,518.43C522.94,590.26 522.94,597.74 564.41,669.57Z"
		/>
	</g>
</svg>

<style>
	svg {
		width: var(--width);
		height: var(--height);
	}
</style>
