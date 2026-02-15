import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initQuad }from "./demo/quad.js";
import { initFlyEnemy } from "./demo/flyEnemy.js";
import { initSlowEnemy } from "./demo/slowEnemy.js";
import { initNewSlowEnemy } from "./demo/newSlowEnemy.js";
import { initAniEnemy} from "./demo/aniEnemy.js";


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

    // init camera
    const camera = new OrthCamera({
        widthSpan: 70,
        aspect: canvas.width / canvas.height,
    });
    camera.setPosition([0, 0, 10]);
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();

    // initFlyEnemy(gl, canvas);
    // initSlowEnemy(gl, canvas);
    // initNewSlowEnemy(gl, canvas, camera);
    initAniEnemy(gl, canvas, camera);
}


main();
