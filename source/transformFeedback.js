import {$assert} from "./common.js";


export default class TransformFeedback {
    transformProgram = null;
    feedbackProgram = null;
    transformFeedback = [];
    index = 0;
    constructor(name='transformFeedback', params={}) {
        this.name = name;
        this.transformProgram = params.transformProgram || null;
        this.feedbackProgram = params.feedbackProgram || null;
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
