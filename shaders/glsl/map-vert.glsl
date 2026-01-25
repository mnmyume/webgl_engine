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

#value uBoidsTexture:4
uniform sampler2D uBoidsTexture;
uniform int uEmitterTexSize;

uniform float uState;
uniform float uLoop;

out vec2 vPosition;
out vec2 vVelocity;

void main() {
    int id = gl_InstanceID;
    int width = uEmitterTexSize;
    int count = width*width;

    float u = (float(id % width) + 0.5) / float(width);
    float v = (float(id / width) + 0.5) / float(width);

    vec4 data = texture(uBoidsTexture, vec2(u, v));
    vec2 pos = data.xy;
    vec2 vel = data.zw;

    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = 1.0;

    vPosition = pos;
    vVelocity = vel;
}