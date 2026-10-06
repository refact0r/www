<script>
	const id = $props.id();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="180 203.5 640 640">
	<defs>
		<mask id="{id}-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
			<g fill="none" stroke="#fff" stroke-width="36">
				<path d="M346.3,327.78L385.68,396" />
				<path d="M212,453L788,453" />
				<path d="M705.7,237.71L375.7,809.29" />
				<path d="M451.5,510L572.3,719.22" />
			</g>
			<g fill="#fff">
				<path
					d="M679.06,471C596.12,471 589.64,474.74 548.17,546.57L516.99,528.57C545.58,479.06 540.92,471 483.76,471L483.76,435C566.7,435 573.17,431.26 614.64,359.43L645.82,377.43C617.24,426.94 621.89,435 679.06,435Z"
				/>
				<path
					d="M533.24,687.57C504.65,638.06 495.35,638.06 466.76,687.57L435.59,669.57C477.06,597.74 477.07,590.29 435.91,519L467.09,501C495.39,550.02 504.65,549.94 533.24,500.43L564.41,518.43C522.94,590.26 522.94,597.74 564.41,669.57Z"
				/>
			</g>
		</mask>
		<filter id="{id}-blend" filterUnits="userSpaceOnUse" x="136" y="163" width="728" height="721">
			<feGaussianBlur stdDeviation="24" />
		</filter>
	</defs>
	<g mask="url(#{id}-ink)">
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
</svg>

<style>
	svg {
		width: var(--width);
		height: var(--height);
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
</style>
