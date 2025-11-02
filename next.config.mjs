/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'm.media-amazon.com',
			},
			{
				protocol: 'https',
				hostname: 'images-na.ssl-images-amazon.com',
			},
			{
				protocol: 'https',
				hostname: 'images-eu.ssl-images-amazon.com',
			},
			{
				protocol: 'https',
				hostname: 'media-amazon.com',
			},
			// bol.com images can be served from s-bol.com and subdomains
			{
				protocol: 'https',
				hostname: 's-bol.com',
			},
			{
				protocol: 'https',
				hostname: 's.s-bol.com',
			},
			{
				protocol: 'https',
				hostname: 'bol.com',
			},
			// Zalando images are typically hosted on ztat.net subdomains
			{
				protocol: 'https',
				hostname: '*.ztat.net',
			},
			// Etsy images
			{
				protocol: 'https',
				hostname: 'i.etsystatic.com',
			},
		],
	},
	async redirects() {
		return [
			{
				source: '/admin',
				destination: '/products',
				permanent: false,
			},
		];
	},
};

export default nextConfig;
