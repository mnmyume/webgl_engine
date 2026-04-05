import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initQuad }from "./demo/quad.js";
import { initGrid } from "./demo/gridDemo.js";
import { initIsoAccAni } from "./demo/isoAccAni.js";
import { initIsoVelAni } from "./demo/isoVelAni.js";
import { initTopdownVelAni } from "./demo/topdownVelAni.js";


function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // const size = Math.min(window.innerWidth, window.innerHeight);
    // canvas.width = size;
    // canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.CULL_FACE);

    // init camera
    const camera = new OrthCamera({
        widthSpan:20,
        aspect: canvas.width / canvas.height,
    });
    camera.setPosition([0, 0, 10]);
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();

    // initGrid(gl, canvas, camera);
    // initIsoVelAni(gl, canvas, camera);
    // initTopdownVelAni(gl, canvas, camera);
    initIsoAccAni(gl, canvas, camera);
}


main();
