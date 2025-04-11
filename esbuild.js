const esbuild = require('esbuild');
const glob = require('glob');
const path = require('path');
const { NodeGlobalsPolyfillPlugin } = require('@esbuild-plugins/node-globals-polyfill'); // Correct import

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Common problem matcher plugin (useful for both builds)
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',
	setup(build) {
		build.onStart(() => {
			console.log(`[watch] build started (${build.initialOptions.platform})`); // Log platform
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log(`[watch] build finished (${build.initialOptions.platform})`); // Log platform
		});
	},
};

/**
 * Web Test Bundler Plugin (Only needed for web test build)
 * @type {import('esbuild').Plugin}
 */
const testBundlePlugin = {
	name: 'testBundlePlugin',
	setup(build) {
		build.onResolve({ filter: /[\/\\]extensionTests\.ts$/ }, args => {
			if (args.kind === 'entry-point') {
				return { path: path.resolve(args.path) };
			}
		});
		build.onLoad({ filter: /[\/\\]extensionTests\.ts$/ }, async args => {
			// Ensure the path construction is robust
			const testsRoot = path.resolve(__dirname, 'src/web/test/suite');
			const pattern = '*.test.{ts,tsx}';
			// Use path.posix.join for consistent glob patterns, especially on Windows
			const globPattern = path.posix.join(testsRoot.replace(/\\/g, '/'), pattern);

			// Use glob.glob with absolute paths for clarity
			const files = await glob.glob(globPattern, { absolute: true });

			// Generate relative import paths from the perspective of extensionTests.ts location
			const importerDir = path.dirname(args.path); // Directory of the virtual extensionTests.ts
			const relativeImports = files.map(f => {
				const relativePath = path.relative(importerDir, f).replace(/\\/g, '/');
				// Ensure it starts with './' if in the same or subdirectory
				return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
			});

			const watchDirs = Array.from(new Set(files.map(f => path.dirname(f)))); // Unique directories

			console.log('[testBundlePlugin] Found test files:', files);
			console.log('[testBundlePlugin] Generated imports:', relativeImports);

			return {
				contents:
					`export { run } from './mochaTestRunner';\n` + // Assuming mochaTestRunner is relative
					relativeImports.map(f => `import('${f}');`).join('\n'),
				// Resolve relative to the importer's directory for watchDirs/Files
				resolveDir: importerDir,
				watchDirs: watchDirs,
				watchFiles: files
			};
		});
	}
};

// --- Base Configuration (Shared settings) ---
const baseConfig = {
	bundle: true,
	// Assuming your source code in 'src/web/extension.ts' can run in both environments
	// If you needed separate source files, you'd change entryPoints per config
	entryPoints: ['src/web/extension.ts'],
	external: ['vscode'],
	format: 'cjs', // Required by VS Code for both Node and Web extensions
	minify: production,
	sourcemap: !production,
	sourcesContent: false, // Reduce sourcemap size
	logLevel: 'silent', // Use our custom plugin for logs/errors
	plugins: [esbuildProblemMatcherPlugin], // Problem matcher for all builds
};

// --- Web Specific Configuration ---
const webConfig = {
	...baseConfig,
	platform: 'browser',
	outdir: 'dist/web',
	define: {
		global: 'globalThis', // Define global for browser environment
	},
	plugins: [
		...baseConfig.plugins, // Include base plugins
		NodeGlobalsPolyfillPlugin({ // Add polyfills ONLY for the web build
			process: true,
			buffer: true,
		}),
	],
};

// --- Node Specific Configuration ---
const nodeConfig = {
	...baseConfig,
	platform: 'node', // Target Node.js runtime
	outdir: 'dist/node', // Separate output directory
	// No 'define' needed for Node
	// No 'NodeGlobalsPolyfillPlugin' needed for Node
	plugins: [
		...baseConfig.plugins, // Only include base plugins
	],
};

// --- Web Test Specific Configuration ---
const webTestConfig = {
	...baseConfig, // Start with base
	entryPoints: ['src/web/test/suite/extensionTests.ts'], // Specific entry point for tests
	platform: 'browser', // Tests run in browser context
	outdir: 'dist/web', // Output test bundle alongside web extension code
	define: {
		global: 'globalThis',
	},
	plugins: [
		NodeGlobalsPolyfillPlugin({ process: true, buffer: true }), // Needs polyfills
		testBundlePlugin, // Add the test bundler plugin
		esbuildProblemMatcherPlugin, // Keep problem matcher
	],
	// Override format if needed, but CJS is usually fine for test runner too
};


async function main() {
	// Create contexts for each build target
	const contexts = [
		esbuild.context(webConfig),     // Context for the web extension build
		esbuild.context(nodeConfig),    // Context for the node extension build
		esbuild.context(webTestConfig) // Context for the web test bundle build
	];

	// Resolve all context promises
	const resolvedContexts = await Promise.all(contexts);

	if (watch) {
		console.log('[watch] Watching web, node, and web-test builds...');
		// Start watching on all contexts
		await Promise.all(resolvedContexts.map(ctx => ctx.watch()));
	} else {
		console.log('[build] Building web, node, and web-test bundles...');
		// Run rebuild on all contexts
		await Promise.all(resolvedContexts.map(ctx => ctx.rebuild()));
		// Dispose all contexts once build is complete
		await Promise.all(resolvedContexts.map(ctx => ctx.dispose()));
		console.log('[build] Finished all builds.');
	}
}

main().catch(e => {
	console.error("Build script failed:", e);
	process.exit(1);
});