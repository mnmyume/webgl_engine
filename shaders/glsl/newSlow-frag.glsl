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
uniform vec2 uGoal;
uniform float uWake;

uniform float uFlowWeight;

// --- Constants for Stability ---
const float SPEED = 3.0;
const float STOP_DIST = 1.6;
const float SETTLE_DIST = 1.2;    // Radius where particles can start settling
const float COLLISION_RAD = 0.75;
const float NEIGHBOR_RAD = 1.0;   // Radius for flocking
const float FRICTION = 0.9;
const float MAX_VEL = 10.0;
const float PUSH_STRENGTH = 6.0;

// --- Flocking Weights ---
const float COHESION_WEIGHT = 0.0;
const float ALIGNMENT_WEIGHT = 0.0;

out vec4[4] fragData;

vec2 getGridCoord(vec2 pos, float emitterSize) {
    vec2 uv = (pos + vec2(emitterSize / 2.0)) / vec2(emitterSize);
    return uv;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(uEmitterTexSize);
    vec2 goal = (vec2(uGoal.x / 32.0, 1.0 - uGoal.y / 32.0) - vec2(0.5));
    goal *= uEmitterSize;

    vec4 data0 = texture(uDataSlot0, uv);
    vec2 pos = data0.xy;
    vec2 vel = data0.zw;
    float activeState = texture(uDataSlot1, uv).x;

    vec2 gridUV = getGridCoord(pos, uEmitterSize);

    if(uWake > 0.5) activeState = 1.0;

    float distToGoal = distance(pos, goal);
    bool atGoal = distToGoal < STOP_DIST;

    vec2 totalImpulse = vec2(0.0);
    vec2 avgVel = vec2(0.0);
    vec2 avgPos = vec2(0.0);
    float neighborCount = 0.0;

    if(uState == 1) {
        pos = texture(uEmitterTexture, uv).xy;
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
                float otherActive = texture(uDataSlot1, otherUV).x;

                vec2 delta = pos - otherData.xy;
                float dSq = dot(delta, delta);
                float d = sqrt(dSq);

                // Separation (Collision)
                float minDist = COLLISION_RAD * 2.1;
                if (d < minDist && d > 0.000001) {
                    float overlap = minDist - d;
                    vec2 n = delta / d;
                    float weight = (otherActive < 0.5) ? 1.5 : 0.8;
                    totalImpulse += n * overlap * weight * PUSH_STRENGTH;

                    if (activeState < 0.5 && !atGoal && otherActive > 0.5) {
                        activeState = 1.0;
                    }
                }

                // Cohesion and Alignment Data Collection
                if (d < NEIGHBOR_RAD && otherActive > 0.5) {
                    avgVel += otherData.zw;
                    avgPos += otherData.xy;
                    neighborCount += 1.0;
                }
            }
        }

        // --- VELOCITY UPDATE ---
        if (activeState > 0.5) {
            vec2 flowDir = texture(uGradientTexture, gridUV).xy;
            if (length(flowDir) < 0.1) flowDir = normalize(goal - pos);

            vel += flowDir * SPEED;

            // Apply Flocking Forces
            if (neighborCount > 0.0) {
                avgVel /= neighborCount;
                avgPos /= neighborCount;

                // Alignment: steer towards average velocity
                vec2 alignmentDir = avgVel - vel == vec2(0.0) ? vec2(0.0) : normalize(avgVel - vel);
                vel += alignmentDir * ALIGNMENT_WEIGHT;

                // Cohesion: steer towards average position center
                vec2 cohesionDir = avgPos - pos == vec2(0.0) ? vec2(0.0) : normalize(avgPos - pos);
                vel += cohesionDir * COHESION_WEIGHT;
            }

            vel += totalImpulse / uDeltaTime;
            vel *= FRICTION;

            if (length(vel) > MAX_VEL) {
                vel = normalize(vel) * MAX_VEL;
            }
        } else {
            vel += totalImpulse / uDeltaTime;
            vel *= 0.5;
        }

        if (atGoal ) {  // && length(vel) < 0.1
            activeState = 0.0;
            vel = vec2(0.0);
        } else if (!atGoal) {
            activeState = 1.0;
        }

        if (activeState > 0.5 || length(vel) > 0.01) {
            pos += 0.7 * vel * uDeltaTime;
        }

        // --- OBSTACLE HANDLING ---
        vec2 nextGridUV = getGridCoord(pos, uEmitterSize);
        vec4 gradData = texture(uGradientTexture, nextGridUV);
        if (gradData.w > 0.5) {
            vec2 normal = gradData.xy;
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
    fragData[1] = vec4(activeState, distToGoal, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}