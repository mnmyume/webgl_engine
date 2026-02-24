import * as math from "gl-matrix";
import {$assert, $convert2NDC, $invProjView} from "./common/commonHelper.js";

export default class Camera {
    constructor({ position = [0, 0, 5], target = [0, 0, 0], up = [0, 1, 0], near = 0.001, far = 1000}) {
        this.position = position;
        this.target = target;
        this.up = up;
        this.near = near;
        this.far = far;

        this.viewMatrix = math.mat4.create();
        this.projectionMatrix = math.mat4.create();
        this.viewInverseMatrix = math.mat4.create();
    }

    updateView() {
        // let view = math.mat4.create();
        // math,mat4.lookAt(view, this.position, this.target, this.up);
        // math,mat4.translate(view, view, [0, 75, 0]);
        // this.viewMatrix = new Float32Array(view);
         this.viewMatrix = new Float32Array(math.mat4.lookAt(
            this.viewMatrix, this.position, this.target, this.up));
    }

    updateViewInverse() {
        math.mat4.invert(this.viewInverseMatrix, this.viewMatrix);
    }

    setPosition(position) {
        this.position = position;
        this.updateView();
    }

    setTarget(target) {
        this.target = target;
        this.updateView();
    }

    //https://stackoverflow.com/questions/2354821/raycasting-how-to-properly-apply-a-projection-matrix
    //https://www.songho.ca/opengl/gl_projectionmatrix.html
    screen2World(gl, point, invProjView){ // zDepth = -1  nearest
        const viewport = gl.getParameter(gl.VIEWPORT)
        $assert(viewport);
        const [x,y, ...resolution] = viewport;

        invProjView = invProjView??$invProjView( math.mat4.create(),this);

        point = $convert2NDC(point,resolution);

        const zDepth = -1;// zDepth = -1  nearest
        const origin = [...point, zDepth, 1]
        math.vec4.transformMat4(origin, origin, invProjView);
        return [origin[0],origin[1],origin[2]];
    }
}
