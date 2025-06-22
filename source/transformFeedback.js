import {$assert} from "./common.js";


export default class TransformFeedback {
    shape = [];
    material = [];
    transformFeedback = [];
    currIndex = 0;
    constructor(params) {
        this.shape = params.shape || null;
        this.material = params.material || null;
        
    }

    initialize({ gl }) {
        this.transformFeedback = [gl.createTransformFeedback(), gl.createTransformFeedback()];

    }


    draw() {
        const destIndex = (this.currIndex + 1) % 2;
        const destTransformFeedback = this.transformFeedback[destIndex];
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destTransformFeedback);
    }

}
