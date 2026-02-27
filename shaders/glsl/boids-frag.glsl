#version 300 es
precision highp float;
precision highp int;

#value uDataSlot0:0
uniform sampler2D uDataSlot0;    // pos.xy, vel.zw
#value uDataSlot1:1
uniform sampler2D uDataSlot1;    // activeState.x
#value uDataSlot2:2
uniform sampler2D uDataSlot2;
#value uDataSlot3:3
uniform sampler2D uDataSlot3;

#value uEmitterTexture:4
uniform sampler2D uEmitterTexture;
#value uGradientTexture:5
uniform sampler2D uGradientTexture;

#value uDeltaTime:0.01666
uniform float uDeltaTime;
uniform float uTime;

#value uState:0
uniform int uState;
uniform bool uLoop;

uniform float uEmitterTexSize;
uniform float uEmitterSize;
uniform float uGridSize;
uniform vec2 uGoal;
uniform float uWake;

uniform float uDuration;
uniform float uLifeTime;


uniform float uFlowWeight;
uniform float uStopDist;
uniform float uSeparationRad;
uniform float uSeparationWeight;
uniform float uNeighborRad;
uniform float uDampScalar;
uniform float uMaxSpeed;
uniform float uCohesionWeight;
uniform float uAlignmentWeight;

out vec4[4] fragData;

vec2 getGridUV(vec2 pos, float gridSize) {
    return pos / gridSize;
}

float sqrtDist(vec2 pos, vec2 otherPos) {
    vec2 delta = pos - otherPos;
    float dSq = dot(delta, delta);
    float d = sqrt(dSq);
    return d;
}

vec2 separation(vec2 pos, vec2 otherPos, float otherActive, float separationRad) {
    vec2 impulse = vec2(0.0);
    vec2 delta = pos - otherPos;
    float dSq = dot(delta, delta);
    float d = sqrt(dSq);

    float minDist = separationRad * 2.0;
    if (d < minDist && d > 0.000001) {
        float overlap = minDist - d;
        vec2 n = delta / d;
        impulse += n * overlap * uSeparationWeight;
    }

    return impulse;
}

vec2 alignment(vec2 vel, vec2 avgVel, float neighborCount, float alignmentWeight) {
    avgVel /= neighborCount;
    vec2 alignmentDir = avgVel - vel == vec2(0.0) ? vec2(0.0) : normalize(avgVel - vel);
    vec2 alig = alignmentDir * alignmentWeight;
    return alig;
}

vec2 cohesion(vec2 pos, vec2 avgPos, float neighborCount, float cohesionWeight) {
    avgPos /= neighborCount;
    vec2 cohesionDir = avgPos - pos == vec2(0.0) ? vec2(0.0) : normalize(avgPos - pos);
    vec2 cohe = cohesionDir * cohesionWeight;
    return cohe;
}

vec2 damp(vec2 vel, float dampScalar, float maxSpeed) {
    vel *= dampScalar;
    if (length(vel) > maxSpeed) {
        vel = normalize(vel) * maxSpeed;
    }
    return vel;
}

vec2 updatePos(vec2 pos, vec2 vel, float deltaTime) {
    pos += vel * uDeltaTime;
    return pos;
}


void main() {
    vec2 uv = gl_FragCoord.xy / vec2(uEmitterTexSize);
    vec2 goal = uGoal;

    vec4 data0 = texture(uDataSlot0, uv);
    vec4 data1 = texture(uDataSlot1, uv);
    vec2 pos = data0.xy;
    vec2 vel = data0.zw;
    float activeState = data1.x;

    vec2 gridUV = getGridUV(pos, uGridSize);

    if(uWake > 0.5)
        activeState = 1.0;

    float distToGoal = distance(pos, goal);
    bool atGoal = distToGoal < uStopDist;

    vec2 totalImpulse = vec2(0.0);
    vec2 avgVel = vec2(0.0);
    vec2 avgPos = vec2(0.0);
    float neighborCount = 0.0;

    float frameLife = mod(uTime, uLifeTime);

    if(uState == 1) {
//        pos = texture(uEmitterTexture, uv).xy;
        activeState = 1.0;
        vel = vec2(0.0);
    } else if(uState == 2) {
        vec2 oldPos = pos;

        // --- NEIGHBOR LOOP (Collision + Flocking) ---
        for(float y = 0.5; y < uEmitterTexSize; y++) {
            for(float x = 0.5; x < uEmitterTexSize; x++) {
                if (abs(x - gl_FragCoord.x) < 0.1 && abs(y - gl_FragCoord.y) < 0.1) continue;

                vec2 otherUV = vec2(x, y) / uEmitterTexSize;
                vec4 otherData = texture(uDataSlot0, otherUV);
                vec2 otherPos = otherData.xy;
                vec2 otherVel = otherData.zw;
                float otherActive = texture(uDataSlot1, otherUV).x;
                float otherDist = distance(pos, otherPos);

                totalImpulse += separation(pos, otherPos, otherActive, uSeparationRad);

                // Cohesion and Alignment Data Collection
                if (otherDist < uNeighborRad && otherActive > 0.5) {
                    avgVel += otherVel;
                    avgPos += otherPos;
                    neighborCount += 1.0;
                }
            }
        }

        // --- VELOCITY UPDATE ---
        if (activeState > 0.5) {
            vec2 flowDir = texture(uGradientTexture, gridUV).xy;
            if (length(flowDir) < 0.1) flowDir = normalize(goal - pos);

            vel += flowDir * uFlowWeight;

            // Apply Flocking Forces
            if (neighborCount > 0.0) {
                vel += alignment(vel, avgVel, neighborCount, uAlignmentWeight);
                vel += cohesion(pos, avgPos, neighborCount, uCohesionWeight);
            }

            vel += totalImpulse;
            vel = damp(vel, uDampScalar, uMaxSpeed);
        }

        if (atGoal) {  // && length(vel) < 0.1
            activeState = 0.0;
            vel = vec2(0.0);
        }

        pos = updatePos(pos, vel, uDeltaTime);

        // --- OBSTACLE HANDLING ---
        vec2 nextGridUV = getGridUV(pos, uGridSize);
        vec4 nextGridData = texture(uGradientTexture, nextGridUV);
        bool isObstacle = nextGridData.w > 0.5;
        if (isObstacle) {
            vec2 normal = nextGridData.xy;
            if (length(normal) > 0.01) {
                normal = normalize(normal);
                pos = oldPos + normal * 0.005;
                vel = reflect(vel, normal) * 0.2;
            } else {
                pos = oldPos;
                vel = vec2(0.0);
            }
        }
    }
    pos = gl_FragCoord.xy;
    fragData[0] = vec4(pos, vel);
    fragData[1] = vec4(activeState, frameLife, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}