import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'esm'
    },
    {
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
      name: 'metrix'

    }
  ],
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
    json(),
    excludeDependenciesFromBundle({ peerDependencies: false, dependencies: true })
  ]
};