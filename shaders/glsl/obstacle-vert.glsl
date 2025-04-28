#ifdef GL_ES
precision highp float;
#endif

#buffer aVert:obstacleBuffer, size:2, stride:8, offset:0
attribute vec2 aVert;

uniform vec2 uWorldSize;

void main() {
    float size = 30.0;
    gl_Position = vec4(aVert/uWorldSize, 0, 1);
    gl_PointSize = size * 2.0;
}