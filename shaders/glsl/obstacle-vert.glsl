#ifdef GL_ES
precision highp float;
#endif

#buffer vert:obstacleBuffer size:2 stride:8 offset:0
attribute vec2 vert;

uniform vec2 worldSize;

void main() {
    float size = 30.0;
    gl_Position = vec4(vert/worldSize, 0, 1);
    gl_PointSize = size * 2.0;
}