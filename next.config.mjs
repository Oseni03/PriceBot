/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	webpack: (config) => {
		config.externals.push({
			"node-telegram-bot-api": "commonjs node-telegram-bot-api",
		});
		return config;
	},
};

export default nextConfig;
