export default class Shader {
    constructor(params = {}) {
        this.name = params.name ?? 'defaultShader';
        this.vertexSource = params.vertexSource ?? null;
        this.fragmentSource = params.fragmentSource ?? null;
        this.shaderProgram = null;
        this.dataLocation = { attributes: {}, uniforms: {} };
    }

    initShaders (gl) {
        let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertexSource)
        let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.fragmentSource)
        let program = this.createProgram(gl, vertexShader, fragmentShader)
    
        if (program) {
            gl.useProgram(program)
            // get program 
            gl.program = program 
            return true
        } else {
            console.log('Failed to create program.')
            return false
        }
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

    createProgram (gl, vertexShader, fragmentShader) {
        let program = gl.createProgram()
        if(!program) return null
    
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
    
        gl.linkProgram(program)
        // link program result
        let linked = gl.getProgramParameter(program, gl.LINK_STATUS)
        if(linked) {
            return program
        } else {
            let error = gl.getProgramInfoLog(program)
            console.log('link program error: ' + error)
            gl.deleteProgram(program)
            gl.deleteShader(vertexShader)
            gl.deleteShader(fragmentShader)
            return null
        }
    }

    use(gl) {
        gl.useProgram(this.shaderProgram);
    }
}
