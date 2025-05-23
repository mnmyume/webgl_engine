import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initAniTest } from "./demo/aniTest.js";
import { autumn } from "./demo/autumnWind.js";
import { initQuad } from "./demo/quad.js";
import {initTransformFeedback} from "./demo/transformFeedback.js";


function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // init camera
    const camera = new OrthCamera({
        widthSpan: 70,
        aspect: canvas.width / canvas.height });
    // const camera = new PerspCamera({
    //     target:[0,10,0]
    // });
    const r = 100,
        cos45 = Math.cos(45 * Math.PI / 180),
        sin35 = Math.sin(35 * Math.PI / 180);
    camera.setPosition([r * cos45, r * sin35, r * cos45]);
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();

    initQuad(gl, canvas, camera);
    // autumn(gl, canvas, camera);
    // initTransformFeedback(gl, canvas, camera);
    // initAniTest(gl, canvas, camera);
}

main();
