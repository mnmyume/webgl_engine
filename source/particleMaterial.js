import {$assert} from "./common.js";
import Texture2D from './texture2d.js';
import Material from "./material.js";


export default class ParticleMaterial extends Material{

    constructor(params = {}) {
        super(params);
        this.numFrames = params.numFrames || 1;
        this.numParticle = params.numParticle || 1;
        this.numGen = params.numGen || 1;
        this.duration = params.duration || 1;
        this.gravity = [0, -9.8, 0];
        this.lifeTime = params.lifeTime || 1;
        this.tileSize = params.tileSize || null;
        this.texWidth = params.texWidth || null;
        this.texHeight = params.texHeight || null;
        this.fps = params.fps || 60;
    }


    initialize({ gl }) {
        super.initialize({ gl });
    }



    draw(gl, time, camera, transform) {

        this.uniforms["time"].value = time.ElapsedTime;

        this.uniforms["duration"].value = this.duration;
        this.uniforms["numParticle"].value = this.numParticle;
        this.uniforms["numGen"].value = this.numGen;
        this.uniforms["gravity"].value = this.gravity;
        this.uniforms["lifeTime"].value = this.lifeTime;

        this.uniforms["_ANI_TEX_0"].value = [
            this.texWidth, this.texHeight, this.tileSize, this.numFrames];

        this.uniforms["_ANI_TEX_0_FPS"].value = this.fps;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);

        super.draw(gl, camera, transform);

    }
}
