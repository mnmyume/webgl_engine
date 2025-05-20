import glsl from './rollup-plugin-glsl.js';
export default [
    {
        // ...
        // input:"./shaders/glsl/index.js",
        // output:{
        //     file:"./shaders/output.js",
        //     format:"esm",
        //     name:'myApp'
        // },
        plugins: [
            glsl({include:'./**/*.glsl'})
        ]
    },
];
