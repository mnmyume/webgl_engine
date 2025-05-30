import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Texture2D from './source/texture2d.js';
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initSimpleQuad } from "./demo/simpleQuad.js";
import { autumn } from "./demo/autumnWind.js";
import { initAniTest } from "./demo/aniTest.js";
import { initSnow } from "./demo/snowCleaned.js";
import { initBlastParticle } from "./demo/blastParticle.js";
import { test } from "./demo/test.js";


const time = new Time();
window.time = time;


function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl');
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

    // initSimpleQuad(gl, camera);
    // autumn(gl, canvas, camera);
    // initAniTest(gl, canvas, camera);
    initSnow(gl, canvas, camera);
    // initBlastParticle(gl, camera);
    // test(gl, canvas, camera);
}

main();
