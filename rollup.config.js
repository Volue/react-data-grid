import path, { isAbsolute } from 'path';
import linaria from '@linaria/rollup';
import postcss from 'rollup-plugin-postcss';
import postcssNested from 'postcss-nested';
import { babel } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

const extensions = ['.ts', '.tsx'];

export default {
  input: './src/index.ts',
  output: [
    {
      file: './lib/bundle.js',
      format: 'es',
      generatedCode: 'es2015',
      sourcemap: true
    },
    {
      file: './lib/bundle.cjs',
      format: 'cjs',
      generatedCode: 'es2015',
      sourcemap: true,
      interop: false
    }
  ],
  external: (id) => !id.startsWith('.') && !id.startsWith('@linaria:') && !isAbsolute(id),
  plugins: [
    linaria({
      preprocessor: 'none'
    }),
    postcss({
      plugins: [postcssNested],
      minimize: true,
      extract: path.resolve('lib/react-data-grid.css')
    }),
    babel({
      babelHelpers: 'runtime',
      extensions,
      // remove all comments except terser annotations
      // https://github.com/terser/terser#annotations
      // https://babeljs.io/docs/en/options#shouldprintcomment
      shouldPrintComment: (comment) => /^[@#]__.+__$/.test(comment)
    }),
    nodeResolve({ extensions })
  ]
};
