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
uniform float uAvoidWeight;
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

vec2 limit(vec2 v, float maxVal) {
    float len = length(v);
    if (len > maxVal && len > 0.0) {
        return normalize(v) * maxVal;
    }
    return v;
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
        vec2 oldPos = texture(uDataSlot0, uv).xy;
        vec2 oldVel = texture(uDataSlot0, uv).zw;
        vec2 acc = vec2(0.0);

        vec2 sep = vec2(0.0); // separation
        vec2 ali = vec2(0.0); // alignment
        vec2 coh = vec2(0.0); // cohesion
        int inPercepCount = 0;

        for(int i=0; i<uCheckCount; i++) {
            float noise = rand(uv + vec2(float(i) * 0.1, uDeltaTime));
            vec2 checkUV = vec2(noise, fract(noise * 123.45));
            vec2 checkPos = texture(uDataSlot0, checkUV).xy;
            vec2 checkVel = texture(uDataSlot0, checkUV).zw;

            float sampleDist = distance(pos, checkPos);

            bool insidePerception = sampleDist > 0.001 && sampleDist < uPercepRadius;

            if (insidePerception) {
                sep += normalize(pos - checkPos) / sampleDist;
                ali += checkVel;
                coh += checkPos;

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
        acc += flowDir * uFlowWeight;

        vel = updateVel(vel, acc);
        vel = damp(vel, uDampScalar);

        pos = updatePos(pos, vel);

        gradientUV = getGradientCoord(pos, uEmitterSize);

        // --- obstacle ---
        float aheadObstacle = texture(uGradientTexture, gradientUV).w;
        bool isAheadObstacle = aheadObstacle > 0.5;
        if (isAheadObstacle) {
            vec2 avoidDir = texture(uGradientTexture, gradientUV).xy;
            vec2 avoidForce = vec2(0.0);

            if (length(vel) > 0.0) {
                avoidForce = avoidDir * uMaxForce * uAvoidWeight;
            } else {
                avoidForce = vec2(rand(uv) - 0.5, rand(uv + 1.0) - 0.5) * uMaxForce * 5.0;
            }

            pos = oldPos;
            vel = -0.5*oldVel;
            acc += avoidForce;
        }
    }

    fragData[0] = vec4(pos, vel);
    fragData[1] = vec4(1.0, 1.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}