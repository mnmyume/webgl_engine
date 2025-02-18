import {$assert} from "./common.js";
import Texture2D from './texture2d.js';
import Material from "./material.js";


export default class PartiMaterial extends Material{

    constructor(params = {}) {
        super(params);
        this.partiCount = params.partiCount || 1;
        this.geneCount = params.geneCount || 1;
        this.duration = params.duration || 1;
        this.lifeTime = params.lifeTime || 1;
    }


    initialize({ gl }) {
        super.initialize({ gl });
    }



    preDraw(gl, time, camera, transform) {

        this.uniforms["time"].value = time.ElapsedTime;

        this.uniforms["duration"].value = this.duration;
        this.uniforms["partiCount"].value = this.partiCount;
        this.uniforms["geneCount"].value = this.geneCount;
        this.uniforms["lifeTime"].value = this.lifeTime;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);

        super.preDraw(gl, camera, transform);

    }
}
