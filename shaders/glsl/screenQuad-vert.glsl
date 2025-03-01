#ifdef GL_ES
precision highp float;
#endif

#buffer quad:quadBuffer size:2 stride:8 offset:0
attribute vec2 quad;

void main() {
    gl_Position = vec4(quad, 0.0, 1.0);
}
