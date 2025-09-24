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
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				crypto: false,
				path: false,
				os: false,
				stream: false,
				util: false,
				url: false,
				assert: false,
				http: false,
				https: false,
				zlib: false,
				querystring: false,
				child_process: false,
				worker_threads: false,
				perf_hooks: false,
				dns: false,
				"node:fs": false,
				"node:path": false,
				"node:os": false,
				"node:crypto": false,
				"node:stream": false,
				"node:util": false,
				"node:url": false,
				"node:buffer": false,
				"node:process": false,
				"node:events": false,
			};

			config.externals = config.externals || [];
			config.externals.push(
				"mongodb",
				"mongodb-client-encryption",
				"@mongodb-js/zstd",
				"snappy",
				"aws4",
				"mongodb-connection-string-url",
				"kerberos",
				"@aws-sdk/credential-providers",
				"gcp-metadata",
				"socks",
				"@napi-rs/snappy-linux-x64-gnu",
				"@napi-rs/snappy-linux-x64-musl",
				"@napi-rs/snappy-darwin-x64",
				"@napi-rs/snappy-win32-x64-msvc",
				"bson-ext",
				"saslprep"
			);

			config.module.rules.push(
				{
					test: /\.node$/,
					use: "ignore-loader",
				},
				{
					test: /node:/,
					use: "ignore-loader",
				}
			);
		}

		return config;
	},
	experimental: {
		serverComponentsExternalPackages: [
			"mongodb",
			"@mongodb-js/zstd",
			"snappy",
			"kerberos",
			"mongodb-client-encryption",
			"@aws-sdk/credential-providers",
			"gcp-metadata",
			"socks",
			"bcryptjs",
			"jsonwebtoken",
			"@napi-rs/snappy-linux-x64-gnu",
			"@napi-rs/snappy-linux-x64-musl",
			"bson-ext",
			"saslprep",
		],
	},
};

export default nextConfig;
