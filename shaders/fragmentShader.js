const fragmentShaderSource = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uDiffCol;
    uniform sampler2D uTexture;

    void main(void) {
        gl_FragColor = texture2D(uTexture, vTexCoord);
    }
`;

export default fragmentShaderSource;
