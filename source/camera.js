// import { mat4 } from 'gl-matrix';
function  $ortho(left, right, bottom, top, near, far) {
    const   lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);

    const out =
        [-2 * lr,                       0,                   0,                 0,
            0,                      -2 * bt,                 0,                 0,
            0,                          0,                  2 * nf,             0,
            (left + right) * lr,   (top + bottom) * bt,   (far + near) * nf,    1];

    return out;
}
export default class Camera {
    constructor({isPersp = false, widthSpan = 10,  position = [0, 0, 5], target = [0, 0, 0], up = [0, 1, 0], fov = 45, aspect = 1, near = 0.001, far = 1000}) {
        this.position = position;
        this.target = target;
        this.up = up;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.widthSpan = widthSpan;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.viewInverseMatrix = mat4.create();
    }

    updateView() {
         this.viewMatrix = new Float32Array(mat4.lookAt(
            this.viewMatrix, this.position, this.target, this.up));
    }

    updateProjection() {

        const  height = this.widthSpan/this.aspect;
        this.left = -this.widthSpan*0.5;
        this.right = this.widthSpan*0.5;
        this.bottom = 0;
        this.top = height;
        this.projectionMatrix = $ortho(this.left,this.right,this.bottom,this.top,this.near,this.far);
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
