#version 300 es
#define POSITION_LOCATION 0
#define LINEAR_VELOCITY_LOCATION 1

precision highp float;
precision highp int;

#value uEmitterSlot0:0
uniform sampler2D uEmitterSlot0;    // posX, posZ, size, startTime
#value uEmitterSlot1:1
uniform sampler2D uEmitterSlot1;    // linVelX, linVelY, linVelZ, _empty
#value uEmitterSlot2:2
uniform sampler2D uEmitterSlot2;    // angVelX, angVelZ, _empty, _empty

#value uDeltaTime:0.01666
uniform float uDeltaTime;

#value uEmitterTransform:mat4(1.0)
uniform mat4 uEmitterTransform;

// uniform int uState;
// uniform bool uLoop;

uniform float uTime;    // game time

uniform float uDuration;
uniform float uLifeTime;
uniform float uCount;

// uFieldParams


// transform feedback params
#buffer a_pos:emitBuffer, size:3, stride:24, offset:0
layout(location = POSITION_LOCATION) in vec3 a_pos;

#buffer a_linVel:emitBuffer, size:3, stride:24, offset:12
layout(location = LINEAR_VELOCITY_LOCATION) in vec3 a_linVel;

out vec3 v_pos;
out vec3 v_linVel;


vec3 updatePos(vec3 pos, vec3 linVel) {
    return pos = pos + linVel * uDeltaTime;
}


void main()
{

    v_pos = updatePos(a_pos, a_linVel);

    gl_Position = vec4(v_pos, 1.0);
}