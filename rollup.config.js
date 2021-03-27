import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'build',
    format: 'cjs'
  },
  intro: `if (!Object.defineProperty) Object.defineProperty = function(obj, prop, descriptor) {obj[prop] = descriptor.value;};`,
  plugins: [typescript(), commonjs({ extensions: ['.js', '.ts'] })]
};