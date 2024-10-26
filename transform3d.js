// import { mat4 } from 'gl-matrix';

export default class Transform3D {
    constructor() {
        this.position = [0, 0, 0];
        this.matrix = mat4.create();
        mat4.identity(this.matrix);
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
    }

    translate(x, y, z) {
        mat4.translate(this.matrix, this.matrix, [x, y, z]);
    }

    rotate(angle, axis) {
        mat4.rotate(this.matrix, this.matrix, angle, axis);
    }

    scale(x, y, z) {
        mat4.scale(this.matrix, this.matrix, [x, y, z]);
    }

    getMatrix() {
        return this.matrix;
    }

    reset() {
        mat4.identity(this.matrix);
    }
}
