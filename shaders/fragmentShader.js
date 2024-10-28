const fragmentShaderSource = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uDiffCol;

    void main(void) {
        gl_FragColor = texture2D(uDiffCol, vTexCoord);
    }
`;

export default fragmentShaderSource;
