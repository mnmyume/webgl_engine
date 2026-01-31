import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initQuad }from "./demo/quad.js";
import { initFlyEnemy } from "./demo/flyEnemy.js";
import { initGroundEnemy } from "./demo/groundEnemy.js";


function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.CULL_FACE);

    // initFlyEnemy(gl, canvas);
    initGroundEnemy(gl, canvas);
}


main();
