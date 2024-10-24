export class Material {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.uniformLocations = {};
    }

    // Initializes the uniform locations and any other setup necessary for the material
    initialize() {
        this.uniformLocations.mWorld = this.gl.getUniformLocation(this.program, "mWorld");
        this.uniformLocations.mView = this.gl.getUniformLocation(this.program, "mView");
        this.uniformLocations.mProj = this.gl.getUniformLocation(this.program, "mProj");
    }

    // Binds the material and sets the uniforms for rendering
    draw(mWorld, mView, mProj) {
        this.gl.useProgram(this.program);

        // Pass the uniforms to the shader
        this.gl.uniformMatrix4fv(this.uniformLocations.mWorld, false, mWorld);
        this.gl.uniformMatrix4fv(this.uniformLocations.mView, false, mView);
        this.gl.uniformMatrix4fv(this.uniformLocations.mProj, false, mProj);
    }
}
