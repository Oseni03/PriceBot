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
		
		// Handle Node.js modules
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			net: false,
			tls: false,
			dns: false,
			child_process: false,
			readline: false,
		};

		return config;
	},
};

export default nextConfig;
