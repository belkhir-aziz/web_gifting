/** @type {import('next').NextConfig} */
const nextConfig = {
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
