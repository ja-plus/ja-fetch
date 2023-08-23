import terser from '@rollup/plugin-terser'; // 代码压缩
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/ja-fetch.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'lib/ja-fetch.esm.js',
        sourcemap: true,
      },
      {
        file: 'lib/ja-fetch.esm.min.js',
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [typescript()],
  },
  {
    input: 'src/preset/interceptors/index.ts',
    output: [
      {
        file: 'preset/interceptors.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'preset/interceptors.js',
        sourcemap: true,
      },
      // {
      //   file: 'preset/interceptors.min.js',
      //   sourcemap: true,
      //   plugins: [terser()],
      // },
    ],
    plugins: [typescript()],
  },
  {
    input: 'src/preset/interceptors/index.ts', // 单独生产d.ts
    output: {
      format: 'esm',
      file: 'preset/interceptors.d.ts',
    },
    plugins: [dts()],
  },
];
