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
#value uMapTexture1:6
uniform sampler2D uMapTexture1; // vPosition, 1.0
#value uMapTexture2:7
uniform sampler2D uMapTexture2; // vVelocity, 1.0

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

vec2 rand(vec2 n){
    return fract(sin(vec2(n.x,n.y*7.0))*43758.5);
}

vec2 getGridCoord(vec2 pos, float emitterSize) {
    vec2 uv = (pos + vec2(emitterSize/2.0))/vec2(emitterSize);
    return uv;
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

vec2 alignmentForce(vec2 vel, vec2 avgVel, float aligWeight) {
    vec2 aligForce = (avgVel - vel);
    return aligForce * aligWeight;
}

vec2 cohesionForce(vec2 pos, vec2 avgPos, float coheWeight) {
    vec2 cohDir = avgPos - pos;
    if(length(cohDir) > 0.2) {
        return normalize(cohDir) * coheWeight;
    } else {
        return vec2(0.0);
    }
}

vec2 separationForce(vec2 uv, vec2 pos, vec2 avgPos, float sepaWeight) {
    float step = 1.0 / uGridSize;

    float dN = texture(uMapTexture1, uv + vec2(0, step)).z;
    float dS = texture(uMapTexture1, uv - vec2(0, step)).z;
    float dE = texture(uMapTexture1, uv + vec2(step, 0)).z;
    float dW = texture(uMapTexture1, uv - vec2(step, 0)).z;

    vec2 sepDir = vec2(dW - dE, dS - dN);
    sepDir += normalize(pos - avgPos);
    return normalize(sepDir) * sepaWeight;
}

void main() {
    vec2 uv = gl_FragCoord.xy/vec2(uEmitterTexSize);

    vec2 pos = texture(uDataSlot0, uv).xy;
    vec2 vel = texture(uDataSlot0, uv).zw;

    vec2 gridUV = getGridCoord(pos, uEmitterSize);

    if(uState == 1){
        pos = texture(uEmitterTexture, uv).xy;
    }
    else if(uState == 2) {
        vec2 oldPos = texture(uDataSlot0, uv).xy;
        vec2 oldVel = texture(uDataSlot0, uv).zw;
        vec2 acc = vec2(0.0);

        vec4 gridPosData = texture(uMapTexture1, gridUV);
        vec4 gridVelData = texture(uMapTexture2, gridUV);

        float density = gridPosData.z;
        vec2 avgPos = pos;
        vec2 avgVel = vec2(0.0);

        if(density > 0.0) {
            avgPos = gridPosData.xy / density;
            avgVel = gridVelData.xy / density;

            acc += alignmentForce(vel, avgVel, uAligWeight);

            acc += cohesionForce(pos, avgPos, uCoheWeight);

            if(density > 4.0) {
                acc += separationForce(gridUV, pos, avgPos, uSepaWeight);
            }
        }

        vec2 flowDir = texture(uGradientTexture, gridUV).xy;
        acc += flowDir * uFlowWeight;

        vel = updateVel(vel, acc);
//        vel = damp(vel, uDampScalar);

        pos = updatePos(pos, vel);

        // --- obstacle ---
        gridUV = getGridCoord(pos, uEmitterSize);
        float aheadObstacle = texture(uGradientTexture, gridUV).w;
        bool isAheadObstacle = aheadObstacle > 0.5;
        if (isAheadObstacle) {
            vec2 avoidDir = texture(uGradientTexture, gridUV).xy;
            vec2 avoidForce = vec2(0.0);

            if (length(vel) > 0.0) {
                avoidForce = avoidDir * uMaxForce * uAvoidWeight;
            } else {
                avoidForce = rand(uv) * uMaxForce * 5.0;
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