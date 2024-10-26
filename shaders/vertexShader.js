const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    uniform mat4 uPMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uMMatrix;
    
    varying vec2 vTexCoord;

    void main(void) {
        gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aPosition, 1.0);
        vTexCoord = aTexCoord;
    }
`;

export default vertexShaderSource;
