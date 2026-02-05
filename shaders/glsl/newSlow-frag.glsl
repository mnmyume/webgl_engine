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

const float SPEED = 0.15;
const float STOP_DIST = 0.05;
const float COLLISION_RAD = 0.03;
const float FRICTION = 0.9; // Keeps the movement controlled and snappy

out vec4[4] fragData;

vec2 getGridCoord(vec2 pos, float emitterSize) {
    vec2 uv = (pos + vec2(emitterSize/2.0))/vec2(emitterSize);
    return uv;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(uEmitterTexSize);
    vec2 goal = (2.0 * vec2(uGoal.x/32.0, 1.0 - uGoal.y/32.0) - vec2(1.0));

    vec4 data0 = texture(uDataSlot0, uv);
    vec2 pos = data0.xy;
    vec2 vel = data0.zw; // Now we actively use and update velocity
    float activeState = texture(uDataSlot1, uv).x;

    vec2 gridUV = getGridCoord(pos, uEmitterSize);

    if(uWake > 0.5) activeState = 1.0;

    float distToGoal = distance(pos, goal);
    bool atGoal = distToGoal < STOP_DIST;
    bool blocked = false;

    vec2 totalImpulse = vec2(0.0);

    // --- INITIALIZE ---
    if(uState == 1){
        pos = texture(uEmitterTexture, uv).xy;
        activeState = 1.0;
        vel = vec2(0.0);
    }
    // --- UPDATE LOOP ---
    else if(uState == 2) {
        vec2 oldPos = pos;

        // --- COLLISION/IMPULSE LOOP ---
        for(float y = 0.0; y < uEmitterTexSize; y++) {
            for(float x = 0.0; x < uEmitterTexSize; x++) {
                if (x == gl_FragCoord.x && y == gl_FragCoord.y) continue;

                vec2 otherUV = (vec2(x, y) + 0.5) / uEmitterTexSize;
                vec4 otherData = texture(uDataSlot0, otherUV);
                float otherActive = texture(uDataSlot1, otherUV).x;
                vec2 otherPos = otherData.xy;
                vec2 otherVel = otherData.zw;

                vec2 delta = pos - otherPos;
                float dSq = dot(delta, delta);
                float minDist = COLLISION_RAD * 2.0;

                if (dSq < minDist * minDist && dSq > 0.00001) {
                    float d = sqrt(dSq);
                    float overlap = minDist - d;
                    vec2 n = delta / d;

                    // Impulse Calculation: Convert overlap into a restorative force
                    // We use a pseudo-spring impulse to resolve penetration over time
                    float stiffness = 0.5;
                    float pushFactor = (otherActive < 0.5) ? 1.0 : 0.5;

                    // The impulse magnitude is proportional to how much we need to move
                    // to resolve the overlap within this frame.
                    totalImpulse += n * (overlap / uDeltaTime) * pushFactor * stiffness;

                    // Blockage Logic (Same as original)
                    if (otherActive < 0.5) {
                        if (distance(pos, goal) > distance(otherPos, goal)) {
                            if (distToGoal < 0.5) blocked = true;
                        }
                    }

                    // Wake Up Logic (Same as original)
                    if (activeState < 0.5 && !atGoal && !blocked) {
                        if (otherActive > 0.5) activeState = 1.0;
                    }
                }
            }
        }

        // --- VELOCITY UPDATE ---
        if (activeState > 0.5) {
            // Apply Flow Force
            vec2 flowDir = texture(uGradientTexture, gridUV).xy;
            if (length(flowDir) < 0.1) flowDir = normalize(goal - pos);

            // Integrate Acceleration (Force) into Velocity
            vel += flowDir * SPEED;

            // Add Collision Impulses to Velocity
            vel += totalImpulse * 0.5;

            // Apply Friction/Damping to keep it from exploding and maintain snappiness
            vel *= FRICTION;
        } else {
            // Kill momentum instantly if sleeping
            vel = vec2(0.0);
        }

        // --- SLEEP DECISION ---
        if (atGoal || blocked) {
            activeState = 0.0;
        }

        // --- POSITION INTEGRATION ---
        if (activeState > 0.5) {
            pos += vel * uDeltaTime;
        }

        // --- OBSTACLE HANDLING (Hard Constraint) ---
        vec2 nextGridUV = getGridCoord(pos, uEmitterSize);
        float aheadObstacle = texture(uGradientTexture, nextGridUV).w;

        if (aheadObstacle > 0.5) {
            vec2 grad = texture(uGradientTexture, nextGridUV).xy;
            if (length(grad) > 0.001) {
                vec2 obstacleNormal = normalize(grad);
                pos = oldPos + (obstacleNormal * 0.01);
                vel *= -0.2; // Slight bounce off walls
            } else {
                pos = oldPos;
                vel = vec2(0.0);
            }
        }
    }

    fragData[0] = vec4(pos, vel); // Velocity is now preserved in the texture
    fragData[1] = vec4(activeState, 0.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}