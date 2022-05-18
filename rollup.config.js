import { uglify } from 'rollup-plugin-uglify' // 代码压缩
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/index.js',
    },
    {
      file: 'lib/index.min.js',
      sourcemap: true,
      plugins: [uglify()],
    },
  ],
}
