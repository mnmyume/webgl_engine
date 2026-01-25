#version 300 es
precision highp float;
precision highp int;

in vec2 vPosition;
in vec2 vVelocity;

out vec4[4] fragData;


void main() {
    // Write Position, Velocity and "1.0" count to the grid
    fragData[0] = vec4(vPosition, 1.0, 1.0);
    fragData[1] = vec4(vVelocity, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}