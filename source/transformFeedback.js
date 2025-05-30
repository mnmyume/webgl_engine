import {$assert} from "./common.js";


export default class TransformFeedback {
    shape = [];
    material = [];
    transformFeedback = [];
    index = 0;
    constructor(params) {
        this.shape = params.shape || null;
        this.material = params.material || null;

    }

    initialize({ gl }) {
        this.transformFeedback = [gl.createTransformFeedback(), gl.createTransformFeedback()];

    }

    transform(gl) {
        const destIndex = (this.index + 1) % 2;
        const destTransformFeedback = this.transformFeedback[destIndex];
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destTransformFeedback);

    }

    begin() {

    }

    end() {

    }

}
