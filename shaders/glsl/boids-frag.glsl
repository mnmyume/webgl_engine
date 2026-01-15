#version 300 es
precision highp float;
precision highp int;

#value uEmitterTexture:0
uniform sampler2D uEmitterTexture;  // pos.x, pos.y, size.z, startTime.w

#value uGradientTexture:1
uniform sampler2D uGradientTexture; // direction.xy, distance.z, obstacle.w

#value uDeltaTime:0.01666
uniform float uDeltaTime;

#value uDataSlot0:2
uniform sampler2D uDataSlot0;    // distance.r, isObstacle.g ( 1.0 == 'obstacle' )
#value uDataSlot1:3
uniform sampler2D uDataSlot1;
#value uDataSlot2:4
uniform sampler2D uDataSlot2;
#value uDataSlot3:5
uniform sampler2D uDataSlot3;

#value uState:0
uniform int uState;  // init mode, uState = 1; play mode, uState = 2;
// #value uLoop:true
uniform bool uLoop;

uniform float uGridSize;
uniform float uEmitterGridSize;

out vec4[4] fragData;

// --- boids params ---
const float MAX_SPEED = 20.0;
const float MAX_FORCE = 0.5;
const float PERCEPTION_RADIUS = 5.0;
const int CHECK_COUNT = 8;

// weights
const float W_SEPARATION = 1.5;
const float W_ALIGNMENT  = 1.0;
const float W_COHESION   = 1.0;
const float W_FLOW       = 2.0;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 getGradientCoord(vec2 pos, float emitterSize) {
    vec2 uv = (pos + vec2(emitterSize/2.0))/vec2(emitterSize);
    return uv;
}

vec2 updatePos(vec2 pos, vec2 linVel) {
    return pos = pos + linVel * uDeltaTime;
}

void main()
{
    vec2 uv = gl_FragCoord.xy/vec2(uEmitterGridSize);

    vec2 pos = texture(uDataSlot0, uv).xy;
    vec2 vel = texture(uDataSlot0, uv).zw;

    vec2 gradientUV = getGradientCoord(pos, uEmitterGridSize);


    if(uState == 1){
        pos = texture(uEmitterTexture, uv).xy;
    }
    else if(uState == 2) {
        vec2 sep = vec2(0.0); // separation
        vec2 ali = vec2(0.0); // alignment
        vec2 coh = vec2(0.0); // cohesion
        int count = 0;

        for(int i=0; i<CHECK_COUNT; i++) {
            float noise = rand(uv + vec2(float(i) * 0.1, uDeltaTime));
            vec2 sampleUV = vec2(noise, fract(noise * 123.45));

            vec4 neighborData = texture(uDataSlot0, sampleUV);
            vec2 neighborPos = neighborData.xy;
            vec2 neighborVel = neighborData.zw;

            float d = distance(pos, neighborPos);

            if (d > 0.001 && d < PERCEPTION_RADIUS) {
                sep += normalize(pos - neighborPos) / d;
                ali += neighborVel;
                coh += neighborPos;

                count++;
            }
        }

        vec2 acc = vec2(0.0);

        if (count > 0) {
            sep /= float(count);
            ali /= float(count);
            coh = (coh / float(count)) - pos;

            if(length(sep) > 0.0) acc += normalize(sep) * W_SEPARATION;
            if(length(ali) > 0.0) acc += normalize(ali) * W_ALIGNMENT;
            if(length(coh) > 0.0) acc += normalize(coh) * W_COHESION;
        }

        vec2 gradientUV = getGradientCoord(pos, uGridSize);
        vec2 flowForce = texture(uGradientTexture, gradientUV).xy;

        acc += flowForce * W_FLOW;

        if(length(acc) > MAX_FORCE) acc = normalize(acc) * MAX_FORCE;

        vel += acc;

        if(length(vel) > MAX_SPEED) vel = normalize(vel) * MAX_SPEED;

        pos += vel * uDeltaTime;

//        // boundary
//        if (uLoop) {
//            if (myPos.x > uGridSize) myPos.x -= uGridSize;
//            if (myPos.x < 0.0)       myPos.x += uGridSize;
//            if (myPos.y > uGridSize) myPos.y -= uGridSize;
//            if (myPos.y < 0.0)       myPos.y += uGridSize;
//        }
    }

    fragData[0] = vec4(pos, vel);
    fragData[1] = vec4(1.0, 1.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}