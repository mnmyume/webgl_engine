import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initQuad }from "./demo/quad.js";
import { initWavefrontField } from "./demo/wavefrontField.js";


function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.CULL_FACE);

    // init camera
    const camera = new OrthCamera({
        widthSpan: 70,
        aspect: canvas.width / canvas.height,
    });
    // const camera = new PerspCamera({
    //     target:[0,10,0]
    // });
    // const r = 700,
    //     cos45 = Math.cos(45 * Math.PI / 180),
    //     sin35 = Math.sin(35 * Math.PI / 180);
    // camera.setPosition([r * cos45, r * sin35, r * cos45]);
    camera.setPosition([0, 0, 10]);
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();


    initWavefrontField(gl, canvas, camera);
}


main();
