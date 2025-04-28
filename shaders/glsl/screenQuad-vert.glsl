#ifdef GL_ES
precision highp float;
#endif

#buffer aQuad:quadBuffer, size:2, stride:8, offset:0
attribute vec2 aQuad;

void main() {
    gl_Position = vec4(aQuad, 0.0, 1.0);
}
