import {$assert} from "./common.js";


export default class Solver {
    shape = [];
    material = [];
    transformFeedback = [];
    currIndex = 0;
    constructor(params) {
        this.shape = params.shape || null;
        this.material = params.material || null;
        this.count = params.count || 1;
    }

    initialize({ gl }) {
        this.transformFeedback = [gl.createTransformFeedback(), gl.createTransformFeedback()];

    }

    update(gl) {

        const destIndex = (this.currIndex + 1) % 2;

        const sourceVAO = this.shape.vao[this.currIndex];
        const destBuffer = this.shape.dataBuffer[destIndex][0].buffer;
        const destTransformFeedback = this.transformFeedback[destIndex];


        this.material.preDraw(gl);

        gl.bindVertexArray(sourceVAO);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destTransformFeedback);

        // NOTE: The following two lines shouldn't be necessary, but are required to work in ANGLE
        // due to a bug in its handling of transform feedback objects.
        // https://bugs.chromium.org/p/angleproject/issues/detail?id=2051
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, destBuffer);

        // gl.vertexAttribDivisor( , 0);

        gl.enable(gl.RASTERIZER_DISCARD);

        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.count);
        gl.endTransformFeedback();


        gl.disable(gl.RASTERIZER_DISCARD);
        this.material.postDraw(gl);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

        this.currIndex = (this.currIndex + 1) % 2;

    }


}
