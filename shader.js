export default class Shader {
    constructor(params = {}) {
        this.name = params.name ?? 'defaultShader';
        this.vertexSource = params.vertexSource ?? null;
        this.fragmentSource = params.fragmentSource ?? null;
        this.shaderProgram = null;
        this.dataLocation = { attributes: {}, uniforms: {} };
    }

    initShaders (gl) {
        this.vertex = this.createShader(gl, gl.VERTEX_SHADER, this.vertexSource);
        this.fragment =this.createShader(gl, gl.FRAGMENT_SHADER, this.fragmentSource);
    }

    createShader (gl, type, source) {
        let shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
    
        // compile shader result
        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if(compiled) {
            return shader
        } else {
            let error = gl.getShaderInfoLog(shader)
            console.log('compile shaders error: ' + error)
            gl.deleteShader(shader)
            return null
        }
    }
}
