const imports = import.meta.glob('/src/content/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
	import: 'default',
	eager: true,
	query: {
		enhanced: true,
		w: '2000;1200;800'
	}
});

const images = Object.values(imports);
for (let i = images.length - 1; i > 0; i--) {
	const j = Math.floor(Math.random() * (i + 1));
	[images[i], images[j]] = [images[j], images[i]];
}

export async function load() {
	return {
		images,
		meta: {
			title: 'photos',
			description: 'just some random photos.'
		}
	};
}
