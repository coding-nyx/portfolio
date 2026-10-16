import { build } from 'esbuild';
await build({
  entryPoints: ['functions/index.mjs'],
  outfile: 'functions/lib/index.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
});
