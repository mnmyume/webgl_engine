
import glsl from "./vite-plugin-glsl.js";
import {defineConfig} from "vite";
export default defineConfig({
    plugins: [
        {... glsl({include:'./**/*.glsl'}), enforce:'pre'},
    ],

    server:{host:true},

    // optimizeDeps: {
    //   exclude: ['@dimforge/rapier2d'],
    // },


});
