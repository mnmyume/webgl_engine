import Shader from './shader.js';
import Camera from './camera.js';
import Transform3D from './transform3d.js';

export default class Material {
    constructor(params = {}) {
        this.shader = params.shader || null;
        this.textures = {};
        this.dataLocation = {
            attributes: {},
            uniforms: {}
        };
    }

    setShader(shader) {
        this.shader = shader;
    }

    initialize({ gl }) {
        this.shaderProgram = this.shader.shaderProgram;

        for (const attr in this.shader.attributes) {
            this.dataLocation.attributes[attr] = gl.getAttribLocation(this.shaderProgram, attr);
        }
        
        for (const name in this.shader.uniforms) {
            this.dataLocation.uniforms[name] = gl.getUniformLocation(this.shaderProgram, name);
        }
    }

    draw(gl, camera, transform) {
        gl.useProgram(this.shaderProgram);

        if (this.dataLocation.uniforms["uPMatrix"] && camera) {
            gl.uniformMatrix4fv(this.dataLocation.uniforms["uPMatrix"], false, camera.projectionMat);
        }
        if (this.dataLocation.uniforms["uVMatrix"] && camera) {
            gl.uniformMatrix4fv(this.dataLocation.uniforms["uVMatrix"], false, camera.viewMatrix);
        }
        if (this.dataLocation.uniforms["uMMatrix"]) {
            gl.uniformMatrix4fv(this.dataLocation.uniforms["uMMatrix"], false, transform.getMatrix());
        }

        for (const [key, value] of Object.entries(this.textures)) {
            const texIndex = this.dataLocation.uniforms[key]?.value;
            gl.activeTexture(gl[`TEXTURE${texIndex}`]);
            gl.bindTexture(value.type === "2DTexture" ? gl.TEXTURE_2D : gl.TEXTURE_CUBE_MAP, value.texture);
        }
    }

    setTexture(name, texture) {
        this.textures[name] = texture;
    }
}
