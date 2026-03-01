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
uniform vec2 uTarget;
uniform float uWake;

uniform float uFlowWeight;

const float SPEED = 0.15;
const float STOP_DIST = 0.05;
const float COLLISION_RAD = 0.03;

out vec4[4] fragData;

vec2 getGridCoord(vec2 pos, float emitterSize) {
    vec2 uv = (pos + vec2(emitterSize/2.0))/vec2(emitterSize);
    return uv;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(uEmitterTexSize);
    vec2 goal = (2.0 * vec2(uTarget.x/32.0, 1.0 - uTarget.y/32.0) - vec2(1.0));

    vec4 data0 = texture(uDataSlot0, uv);
    vec2 pos = data0.xy;
    vec2 vel = data0.zw;
    float activeState = texture(uDataSlot1, uv).x;

    vec2 gridUV = getGridCoord(pos, uEmitterSize);

    // 1. Force Wake on Click
    if(uWake > 0.5) activeState = 1.0;

    float distToGoal = distance(pos, goal);
    bool atGoal = distToGoal < STOP_DIST;
    bool blocked = false;

    vec2 separation = vec2(0.0);
    vec2 moveForce = vec2(0.0);

    // --- INITIALIZE ---
    if(uState == 1){
        pos = texture(uEmitterTexture, uv).xy;
        activeState = 1.0;
        vel = vec2(0.0);
    }
    // --- UPDATE LOOP ---
    else if(uState == 2) {

        vec2 oldPos = pos;

        // --- COLLISION LOOP ---
        for(float y = 0.0; y < uEmitterTexSize; y++) {
            for(float x = 0.0; x < uEmitterTexSize; x++) {
                if (x == gl_FragCoord.x && y == gl_FragCoord.y) continue;

                vec2 otherUV = (vec2(x, y) + 0.5) / uEmitterTexSize;
                vec4 otherData0 = texture(uDataSlot0, otherUV);
                float otherActive = texture(uDataSlot1, otherUV).x;
                vec2 otherPos = otherData0.xy;

                vec2 delta = pos - otherPos;
                float dSq = dot(delta, delta);
                float minDist = COLLISION_RAD * 2.0;

                if (dSq < minDist * minDist && dSq > 0.00001) {
                    float d = sqrt(dSq);
                    float overlap = minDist - d;
                    vec2 n = delta / d;

                    overlap = min(overlap, 0.05); // Cap overlap to reduce explosion

                    // A. Physical Push (Separation)
                    // We calculate this even if sleeping, BUT we only apply it later if we are awake.
                    float pushFactor = (otherActive < 0.5) ? 1.0 : 0.5;
                    separation += n * overlap * pushFactor;

                    // B. Blockage Logic
                    if (otherActive < 0.5) {
                        // If neighbor is SLEEPING and CLOSER to goal, they block us.
                        if (distance(pos, goal) > distance(otherPos, goal)) {
                            // Only get discouraged if we are somewhat close to goal
                            // Prevents getting stuck far away
                            if (distToGoal < 0.5) {
                                blocked = true;
                            }
                        }
                    }

                    // C. Wake Up Logic
                    // Wake up if I am hit by an active unit (and I'm not blocked/at goal)
                    if (activeState < 0.5 && !atGoal && !blocked) {
                        if (otherActive > 0.5) {
                            activeState = 1.0;
                        }
                    }
                }
            }
        }

        // --- MOVEMENT ---
        if (activeState > 0.5) {
            vec2 flowDir = texture(uGradientTexture, gridUV).xy;
            if (length(flowDir) < 0.1) flowDir = normalize(goal - pos);
            moveForce += flowDir * SPEED * uDeltaTime;
        }

        // --- SLEEP DECISION ---
        if (atGoal || blocked) {
            activeState = 0.0;
        }

        // --- FREEZE ON SLEEP ---
        // Only apply forces if the unit is explicitly AWAKE.
        // If it is sleeping (activeState < 0.5), position remains completely unchanged.
        if (activeState > 0.5) {
            pos += moveForce;
            pos += separation * 0.5;
        }

        // --- MAP OBSTACLES ---
        vec2 nextGridUV = getGridCoord(pos, uEmitterSize);
        float aheadObstacle = texture(uGradientTexture, nextGridUV).w;

        if (aheadObstacle > 0.5) {
            vec2 grad = texture(uGradientTexture, nextGridUV).xy;
            if (length(grad) > 0.001) {
                vec2 obstacleNormal = normalize(grad);
                pos = oldPos + (obstacleNormal * 0.01);
            } else {
                pos = oldPos;
            }
        }
    }

    fragData[0] = vec4(pos, vel);
    fragData[1] = vec4(activeState, 0.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}