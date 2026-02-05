import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initQuad }from "./demo/quad.js";
import { initFlyEnemy } from "./demo/flyEnemy.js";
import { initSlowEnemy } from "./demo/slowEnemy.js";
import { initNewSlowEnemy } from "./demo/newSlowEnemy.js";


function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl2');
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    // gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.CULL_FACE);

    // initFlyEnemy(gl, canvas);
    // initSlowEnemy(gl, canvas);
    initNewSlowEnemy(gl, canvas);
}


main();
