import { terser } from 'rollup-plugin-terser' // 代码压缩
import typescript from '@rollup/plugin-typescript'
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/ja-fetch.js',
    },
    {
      file: 'lib/ja-fetch.min.js',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [typescript()],
}
