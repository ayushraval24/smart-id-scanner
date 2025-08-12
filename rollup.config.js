import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
    // UMD build (for browsers)
    {
        input: 'src/index.js',
        output: {
            name: 'CardScanner',
            file: 'dist/index.js',
            format: 'umd',
            sourcemap: true
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            terser(),
            copy({
                targets: [{ src: 'src/index.d.ts', dest: 'dist' }]
            })
        ]
    },
    // ESM build (for modern bundlers)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.esm.js',
            format: 'esm',
            sourcemap: true
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            copy({
                targets: [{ src: 'src/index.d.ts', dest: 'dist' }]
            })
        ]
    },
    // CommonJS build (for Node.js)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.cjs.js',
            format: 'cjs',
            sourcemap: true
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            copy({
                targets: [{ src: 'src/index.d.ts', dest: 'dist' }]
            })
        ]
    }
];
