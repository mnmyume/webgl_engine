import {$assert} from "./common.js";
import Texture2D from './texture2d.js';
import Material from "./material.js";


export default class ParticleMaterial extends Material{

    constructor(params = {}) {
        super(params);
        this.numFrames = params.numFrames || 1;
        this.frameDuration = params.frameDuration || 1;
        this.duration = params.duration || 1;
        this.now_ = new Date();
        this.timeBase_ = new Date();
        this.tileSize = params.tileSize || null;
        this.texWidth = params.texWidth || null;
        this.texHeight = params.texHeight || null;
        this.fps = params.fps || 60;
    }


    initialize({ gl }) {
        super.initialize({ gl });

        this.uniforms["rampSampler"].value = 0;
        this.uniforms["colorSampler"].value = 1;
        this.uniforms["posSampler"].value = 2;

    }



    draw(gl, time, camera, transform) {

        this.uniforms["duration"].value = this.duration;

        this.uniforms["_ANI_TEX_0"].value = [
            this.texWidth, this.texHeight, this.tileSize, this.numFrames];

        this.uniforms["_ANI_TEX_0_FPS"].value = this.fps;

        super.draw(gl, time, camera, transform);

    }
}
