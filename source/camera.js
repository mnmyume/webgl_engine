// import { mat4 } from 'gl-matrix';

export default class Camera {
    constructor({position = [0, 0, 5], target = [0, 0, 0], up = [0, 1, 0], fov = 45, aspect = 1, near = 0.1, far = 9000}) {
        this.position = position;
        this.target = target;
        this.up = up;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.viewInverseMatrix = mat4.create();
    }

    updateView() {
         this.viewMatrix = new Float32Array(mat4.lookAt(
            this.viewMatrix, this.position, this.target, this.up));
    }

    updateProjection() {

        const width = 100,
            height = width/this.aspect;


        this.projectionMatrix = new Float32Array(mat4.ortho(
            this.projectionMatrix, -0.5*width, 0.5*width, -0.2*height, 0.8*height, this.near, this.far
        ));
        // this.projectionMatrix = new Float32Array(mat4.perspective(
        //     this.projectionMatrix, this.fov * Math.PI / 180, this.aspect, this.near, this.far));
    }

    updateViewInverse() {
        mat4.invert(this.viewInverseMatrix, this.viewMatrix);
    }

    setAspect(aspect) {
        this.aspect = aspect;
        this.updateProjection();
    }

    setPosition(position) {
        this.position = position;
        this.updateView();
    }

    setTarget(target) {
        this.target = target;
        this.updateView();
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    getViewInverseMatrix() {
        return this.viewInverseMatrix;
    }
}
