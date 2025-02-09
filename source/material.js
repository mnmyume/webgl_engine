import {$assert} from "./common.js";
import Texture2D from './texture2d.js';


export default class Material {
    textures = {};
    shaderProgram = null;
    shader = null;
    dataLocation = {
        attributes: {},
        uniforms: {},
    };
    constructor(params = {}) {
        this.shader = params.shader || null;
    }


    initialize({ gl }) {

        this.attributes = JSON.parse(JSON.stringify(this.shader.attributes));
        this.uniforms = JSON.parse(JSON.stringify(this.shader.uniforms));

        this.vertex = this.shader.vertex;
        this.fragment = this.shader.fragment;

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, this.vertex);
        gl.attachShader(this.shaderProgram, this.fragment);

        gl.linkProgram(this.shaderProgram);
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(this.shaderProgram);
            throw new Error("Could not compile WebGL program. \n\n" + info);
          }

        for (const attr in this.attributes) {
            this.dataLocation.attributes[attr] = gl.getAttribLocation(this.shaderProgram, attr);
        }
        
        for (const name in this.uniforms) {
            this.dataLocation.uniforms[name] = gl.getUniformLocation(this.shaderProgram, name);
        }
    }

    setTexture(key, texture){
        $assert(texture instanceof Texture2D);
        $assert(this.uniforms[key]);
        this.textures[key] = texture;
    }

    preDraw(gl, camera, transform) {

        gl.useProgram(this.shaderProgram);

        for(const [key,value] of Object.entries(this.textures)){
            const texIndex = this.uniforms[key].value;
            gl.activeTexture(gl[`TEXTURE${texIndex}`]);
            let TYPE;
            if(value.type === "2DTexture")
                TYPE = gl.TEXTURE_2D;
            else if(value.type === "3DTexture")
                TYPE = gl.TEXTURE_CUBE_MAP;
            else
                $assert(false);
            gl.bindTexture(TYPE, value.texture);
        }

        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        // gl.blendEquation(gl.FUNC_ADD);

        for(var name in this.uniforms){
            const data = this.uniforms[name];

            if(data.type === "bool" ||
                data.type === "int" ||
                data.type === 'sampler2D' || data.type === 'samplerCube')
                gl.uniform1i(this.dataLocation.uniforms[name], data.value);
            else if(data.type === "float")
                gl.uniform1f(this.dataLocation.uniforms[name], data.value);
            else{

                if(/vec/.test(data.type))
                    $assert(data.value, 'empty uniform vec');

                if(data.type === "vec2")
                    gl.uniform2f(this.dataLocation.uniforms[name], data.value[0],data.value[1]);
                else if(data.type === "vec3")
                    gl.uniform3f(this.dataLocation.uniforms[name], data.value[0], data.value[1],data.value[2]);
                else if(data.type === "vec4")
                    gl.uniform4f(this.dataLocation.uniforms[name], data.value[0], data.value[1],data.value[2],data.value[3]);
            }
        };

        if (this.dataLocation.uniforms["uPMatrix"] && camera) {
            gl.uniformMatrix4fv(this.dataLocation.uniforms["uPMatrix"], false, camera.projectionMatrix);
        }
        if (this.dataLocation.uniforms["uVMatrix"] && camera) {
            gl.uniformMatrix4fv(this.dataLocation.uniforms["uVMatrix"], false, camera.viewMatrix);
        }
        if (this.dataLocation.uniforms["uVInverseMatrix"] && camera) {
            gl.uniformMatrix4fv(this.dataLocation.uniforms["uVInverseMatrix"], false, camera.viewInverseMatrix);
        }
        if (this.dataLocation.uniforms["uMMatrix"] && transform) {
            gl.uniformMatrix4fv(this.dataLocation.uniforms["uMMatrix"], false, transform.getMatrix());
        }

        if(this.dataLocation.uniforms["uNMatrix"]){
            //transform
            //http://stackoverflow.com/questions/5255806/how-to-calculate-tangent-and-binormal
            //http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/

            // mat4.multiply(tmpMat4, cam.GetViewMatrix(), this.worldMatrix);
            // mat4.invert(tmpMat4,tmpMat4);
            // mat3.fromMat4(tmpMat3,tmpMat4);
            // mat3.transpose(tmpMat3,tmpMat3);

            //((camMat * worldMat)^-1)^T
            //(worldMat^-1 * camMat^T)^T
            //camMat * ((RS)^-1)^T
            //camMat * R * S^-1
            const tmpMat3 = math.mat3.create(),
                viewMat3 = math.mat3.create();
            math.mat3.fromMat4(viewMat3,cam.viewMatrix);
            math.mat3.multiply(tmpMat3, viewMat3, transform.rotationMatrix);

            let [sx, sy, sz]  = transform.scale;
            const sxInv = sx==0?Math.maxInt:1/sx,
                syInv = sy==0?Math.maxInt:1/sy,
                szInv = sz==0?Math.maxInt:1/sz;
            tmpMat3[0]*=sxInv;
            tmpMat3[4]*=syInv;
            tmpMat3[8]*=szInv;

            gl.uniformMatrix3fv(this.dataLocation.uniforms["uNMatrix"], false, tmpMat3);
        }

    }

    postDraw(gl){
        gl.useProgram(null);
        for(const [key,value] of Object.entries(this.textures)){
            const texIndex = this.uniforms[key].value;
            gl.activeTexture(gl[`TEXTURE${texIndex}`]);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
}
