#ifdef GL_ES
precision highp float;
#endif

attribute vec2 quad;

void main() {
    gl_Position = vec4(quad, 0.0, 1.0);
}
