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

#value uEmitterTexture:4
uniform sampler2D uEmitterTexture;  // pos.xy, size.z, startTime.w
#value uGradientTexture:5
uniform sampler2D uGradientTexture; // direction.xy, distance.z, obstacle.w

#value uDeltaTime:0.01666
uniform float uDeltaTime;
uniform float uTime;

#value uState:0
uniform int uState;  // init mode, uState = 1; play mode, uState = 2;
// #value uLoop:true
uniform bool uLoop;

uniform float uGridSize;
uniform float uEmitterTexSize;
uniform float uEmitterSize;
// --- boids params ---
uniform float uMaxSpeed;
uniform float uMaxForce;
uniform float uPercepRadius;
uniform int uCheckCount;
uniform float uSepaWeight;
uniform float uAligWeight;
uniform float uCoheWeight;
uniform float uFlowWeight;
uniform float uDampScalar;

out vec4[4] fragData;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 getGradientCoord(vec2 pos, float emitterSize) {
    vec2 uv = (pos + vec2(emitterSize/2.0))/vec2(emitterSize);
    return uv;
}

vec2 updateAcc(vec2 acc, vec2 force, float weight) {
    acc = acc + normalize(force) * weight;
    return acc;
}

vec2 updateVel(vec2 vel, vec2 acc) {
    return vel = vel + acc * uDeltaTime;
}

vec2 updatePos(vec2 pos, vec2 linVel) {
    return pos = pos + linVel * uDeltaTime;
}

vec2 damp(vec2 vel, float k) {
    return vel*k;
}

void main() {
    vec2 uv = gl_FragCoord.xy/vec2(uEmitterTexSize);

    vec2 pos = texture(uDataSlot0, uv).xy;
    vec2 vel = texture(uDataSlot0, uv).zw;

    vec2 gradientUV = getGradientCoord(pos, uEmitterSize);

    if(uState == 1){
        pos = texture(uEmitterTexture, uv).xy;
    }
    else if(uState == 2) {
        vec2 oldVel = texture(uDataSlot0, uv).zw;
        vec2 sep = vec2(0.0); // separation
        vec2 ali = vec2(0.0); // alignment
        vec2 coh = vec2(0.0); // cohesion
        vec2 acc = vec2(0.0);
        int inPercepCount = 0;

        for(int i=0; i<uCheckCount; i++) {
            float noise = rand(uv + vec2(float(i) * 0.1, uDeltaTime));
            vec2 sampleUV = vec2(noise, fract(noise * 123.45));

            vec4 sampleData = texture(uDataSlot0, sampleUV);
            vec2 samplePos = sampleData.xy;
            vec2 sampleVel = sampleData.zw;

            float d = distance(pos, samplePos);

            bool insidePerception = d > 0.001 && d < uPercepRadius;

            if (insidePerception) {
                sep += normalize(pos - samplePos) / d;
                ali += sampleVel;
                coh += samplePos;

                inPercepCount++;
            }
        }

        if (inPercepCount > 0) {
            sep /= float(inPercepCount);
            ali /= float(inPercepCount);
            coh = (coh / float(inPercepCount)) - pos;

            if(length(sep) > 0.0)
                acc = updateAcc(acc, sep, uSepaWeight);
            if(length(ali) > 0.0)
                acc = updateAcc(acc, ali, uAligWeight);
            if(length(coh) > 0.0)
                acc = updateAcc(acc, coh, uCoheWeight);
        }

        vec2 flowDir = texture(uGradientTexture, gradientUV).xy;
        if (length(flowDir) > 0.0) {
            // steer force
            vec2 desired = normalize(flowDir) * uMaxSpeed;
            vec2 steer = desired - vel;

            if(length(steer) > uMaxForce) steer = normalize(steer) * uMaxForce;

            acc += steer * 1.0;
        }

        // --- obstacle ---
//        float lookAheadDist = uPercepRadius * 1.5;
//        vec2 probePos = pos;
//        if (length(vel) > 0.0) {
//            probePos = pos + normalize(vel) * lookAheadDist;
//        }
//        vec2 probeUV = getGradientCoord(probePos, uEmitterTexSize);
//        float isObstacleAhead = texture(uGradientTexture, probeUV).w;
//
//        if (isObstacleAhead > 0.5) {
//            // steer back
//            vec2 avoidForce = vec2(0.0);
//
//            if (length(vel) > 0.0) {
//                avoidForce = -normalize(vel) * uMaxForce * 10.0; // 5.0 is avoidWeight
//            } else {
//                avoidForce = vec2(rand(uv) - 0.5, rand(uv + 1.0) - 0.5) * uMaxForce * 5.0;
//            }
//
//            acc += avoidForce;
//        }
//        float isInside = texture(uGradientTexture, gradientUV).w;
//        if (isInside > 0.5) {
//            vel *= -0.5;
//            acc = vec2(0.0);
//        }

//        if(length(acc) > uMaxForce) acc = normalize(acc) * uMaxForce;
//
//        vel = updateVel(vel, acc);
//
//        if(length(vel) > uMaxSpeed) vel = normalize(vel) * uMaxSpeed;

        vel = updateVel(vel, acc);

        vel = damp(vel, uDampScalar);


        pos = updatePos(pos, vel);
    }

    fragData[0] = vec4(pos, vel);
    fragData[1] = vec4(1.0, 1.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}