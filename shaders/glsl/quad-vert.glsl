#ifdef GL_ES
precision highp float;
#endif

attribute vec2 quad;
varying vec2 vUV;

void main() {
    vUV = (quad + 1.0) / 2.0;
    gl_Position = vec4(quad, 0.0, 1.0);
}
