#version 300 es
precision highp float;
precision highp int;

#value uDataSlot0:0
uniform sampler2D uDataSlot0;    // pos.xy, vel.zw
#value uDataSlot1:1
uniform sampler2D uDataSlot1;    // activeState.x

#value uEmitterTexture:4
uniform sampler2D uEmitterTexture;
#value uGradientTexture:5
uniform sampler2D uGradientTexture;

#value uDeltaTime:0.01666
uniform float uDeltaTime;
uniform float uTime;

#value uState:0
uniform int uState;

uniform float uEmitterTexSize;
uniform float uGridSize;

#value uTarget:[0,0]
uniform vec2 uTarget;
#value uWake:0.0
uniform float uWake;

#value uLifeTime:20.0
uniform float uLifeTime;

// boidsVel-compatible params
#value uFlowWeight:1.0
uniform float uFlowWeight;
#value uStopDist:0.1
uniform float uStopDist;
#value uSeparationRad:1.0
uniform float uSeparationRad;
#value uSeparationWeight:1.0
uniform float uSeparationWeight;
#value uNeighborRad:1.0
uniform float uNeighborRad;
#value uDampScalar:0.97
uniform float uDampScalar;
#value uMaxSpeed:10.0
uniform float uMaxSpeed;
#value uCohesionWeight:0.0
uniform float uCohesionWeight;
#value uAlignmentWeight:0.0
uniform float uAlignmentWeight;

// Backward-compatible acc params.
#value uMaxForce:0.0
uniform float uMaxForce;
#value uPercepRadius:0.0
uniform float uPercepRadius;
#value uSepaWeight:0.0
uniform float uSepaWeight;
#value uAligWeight:0.0
uniform float uAligWeight;
#value uCoheWeight:0.0
uniform float uCoheWeight;

out vec4[4] fragData;

vec2 getGridUV(vec2 pos, float gridSize) {
    return vec2(pos.x / gridSize, pos.y / gridSize);
}

float getNeighborRad() {
    return uNeighborRad > 0.0 ? uNeighborRad : uPercepRadius;
}

float getSeparationRad() {
    float neighborRad = getNeighborRad();
    return uSeparationRad > 0.0 ? uSeparationRad : neighborRad;
}

float getSeparationWeight() {
    return abs(uSeparationWeight) > 0.000001 ? uSeparationWeight : uSepaWeight;
}

float getAlignmentWeight() {
    return abs(uAlignmentWeight) > 0.000001 ? uAlignmentWeight : uAligWeight;
}

float getCohesionWeight() {
    return abs(uCohesionWeight) > 0.000001 ? uCohesionWeight : uCoheWeight;
}

vec2 separationAcc(vec2 pos, vec2 otherPos, float separationRad, float separationWeight) {
    vec2 delta = pos - otherPos;
    float dSq = dot(delta, delta);
    float d = sqrt(dSq);

    float minDist = separationRad * 2.0;
    if (d < minDist && d > 0.000001) {
        float overlap = minDist - d;
        vec2 n = delta / d;
        return n * overlap * separationWeight;
    }

    return vec2(0.0);
}

vec2 alignmentAcc(vec2 vel, vec2 avgVel, float neighborCount, float alignmentWeight) {
    avgVel /= neighborCount;
    vec2 desired = avgVel - vel;
    if (desired == vec2(0.0)) return vec2(0.0);
    return normalize(desired) * alignmentWeight;
}

vec2 cohesionAcc(vec2 pos, vec2 avgPos, float neighborCount, float cohesionWeight) {
    avgPos /= neighborCount;
    vec2 dir = avgPos - pos;
    if (dir == vec2(0.0)) return vec2(0.0);
    return normalize(dir) * cohesionWeight;
}

vec2 damp(vec2 vel, float dampScalar, float maxSpeed) {
    vel *= dampScalar;
    if (length(vel) > maxSpeed) {
        vel = normalize(vel) * maxSpeed;
    }
    return vel;
}

vec2 updatePos(vec2 pos, vec2 vel) {
    pos += vel * uDeltaTime;
    return pos;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(uEmitterTexSize);
    vec2 goal = uTarget;

    vec4 data0 = texture(uDataSlot0, uv);
    vec4 data1 = texture(uDataSlot1, uv);
    vec2 pos = data0.xy;
    vec2 vel = data0.zw;
    float activeState = data1.x;

    if (uWake > 0.5) {
        activeState = 1.0;
    }

    float distToGoal = distance(pos, goal);
    bool atGoal = distToGoal < uStopDist;

    float separationRad = getSeparationRad();
    float neighborRad = getNeighborRad();
    float separationWeight = getSeparationWeight();
    float alignmentWeight = getAlignmentWeight();
    float cohesionWeight = getCohesionWeight();

    vec2 separation = vec2(0.0);
    vec2 avgVel = vec2(0.0);
    vec2 avgPos = vec2(0.0);
    float neighborCount = 0.0;

    float frameLife = mod(uTime, max(0.0001, uLifeTime));

    if (uState == 1) {
        pos = texture(uEmitterTexture, uv).xy;
        activeState = 1.0;
        vel = vec2(0.0);
    } else if (uState == 2) {
        vec2 oldPos = pos;

        // --- NEIGHBOR LOOP (Collision + Flocking) ---
        for (float y = 0.5; y < uEmitterTexSize; y++) {
            for (float x = 0.5; x < uEmitterTexSize; x++) {
                if (abs(x - gl_FragCoord.x) < 0.1 && abs(y - gl_FragCoord.y) < 0.1) continue;

                vec2 otherUV = vec2(x, y) / uEmitterTexSize;
                vec4 otherData = texture(uDataSlot0, otherUV);
                vec2 otherPos = otherData.xy;
                vec2 otherVel = otherData.zw;
                float otherActive = texture(uDataSlot1, otherUV).x;
                float otherDist = distance(pos, otherPos);

                if (otherActive > 0.5) {
                    separation += separationAcc(pos, otherPos, separationRad, separationWeight);
                }

                if (otherDist < neighborRad && otherActive > 0.5) {
                    avgVel += otherVel;
                    avgPos += otherPos;
                    neighborCount += 1.0;
                }
            }
        }

        // --- ACCELERATION UPDATE ---
        if (activeState > 0.5) {
            vec2 gridUV = getGridUV(pos, uGridSize);
            vec2 flowDir = texture(uGradientTexture, gridUV).xy;
            if (length(flowDir) < 0.1) {
                flowDir = normalize(goal - pos);
            }

            vec2 acc = vec2(0.0);
            acc += flowDir * uFlowWeight;

            if (neighborCount > 0.0) {
                acc += alignmentAcc(vel, avgVel, neighborCount, alignmentWeight);
                acc += cohesionAcc(pos, avgPos, neighborCount, cohesionWeight);
            }

            acc += separation;

            if (uMaxForce > 0.0 && length(acc) > uMaxForce) {
                acc = normalize(acc) * uMaxForce;
            }

            vel += acc * uDeltaTime;
            vel = damp(vel, uDampScalar, uMaxSpeed);
        }

        if (atGoal) {
            activeState = 0.0;
            vel = vec2(0.0);
        }

        pos = updatePos(pos, vel);

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

    fragData[0] = vec4(pos, vel);
    fragData[1] = vec4(activeState, frameLife, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}
