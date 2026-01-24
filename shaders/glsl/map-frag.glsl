#version 300 es
precision highp float;
precision highp int;

#value uDataSlot0:0
uniform sampler2D uDataSlot0;    // pos.xy, vel.zw
#value uDataSlot1:1
uniform sampler2D uDataSlot1;
#value uDataSlot2:2
uniform sampler2D uDataSlot2;
#value uDataSlot3:3
uniform sampler2D uDataSlot3;

uniform float uState;
uniform float uLoop;

in vec2 vPosition;
in vec2 vVelocity;

out vec4[4] fragData;


void main() {
    // Write Velocity and "1.0" count to the grid
//    fragData[0] = vec4(vPosition, vVelocity);
    fragData[0] = vec4(vVelocity, 1.0, 1.0);
    fragData[1] = vec4(1.0, 1.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}