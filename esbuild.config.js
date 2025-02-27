import { context } from 'esbuild';

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: true,
  treeShaking: true,
  packages: 'external',
  minify: process.env.NODE_ENV === 'production',
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await context(config);
  await ctx.watch();
} else {
  const ctx = await context(config);
  await ctx.rebuild();
  await ctx.dispose();
}

export default config;
