precision mediump float;

varying vec2 vUV;

#value texture:0
uniform sampler2D texture;

void main(void) {
    gl_FragColor = texture2D(texture, vUV);
}
