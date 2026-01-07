#version 300 es
precision highp float;
precision highp int;

#value uWavefrontTexture:0
uniform sampler2D uWavefrontTexture;    // currDist.r, isObstacle.g ( 1.0 == 'obstacle' ), isGoal.b ( 1.0 == 'goal')

#value uDataSlot0:1
uniform sampler2D uDataSlot0;    // currDist.r, isObstacle.g ( 1.0 == 'obstacle' ), isGoal.b ( 1.0 == 'goal')
#value uDataSlot1:2
uniform sampler2D uDataSlot1;
#value uDataSlot2:3
uniform sampler2D uDataSlot2;
#value uDataSlot3:4
uniform sampler2D uDataSlot3;

#value uState:0
uniform int uState;  // init mode, uState = 1; play mode, uState = 2;
// #value uLoop:true
uniform bool uLoop;

uniform float uGridSize;
uniform float uEmitterSize;

vec2 direction[4] = vec2[](
    vec2(-1, 0),   // left
    vec2(1, 0),    // right
    vec2(0, 1),    // top
    vec2(0, -1)   // bottom
);

out vec4[4] fragData;

void main()
{
    vec2 gridCoord = gl_FragCoord.xy - vec2(0.5);
    vec2 uv = gl_FragCoord.xy / vec2(uGridSize);

    float currDist;
    float isObastacle;
    float isGoal;

    // init
    if(uState == 1) {
        vec2 initUV = vec2(uv.x, 1.0 - uv.y);
        currDist = texture(uWavefrontTexture, initUV).r;
        isObastacle = texture(uWavefrontTexture, initUV).g;
        isGoal = texture(uWavefrontTexture, initUV).b;

    } else if(uState == 2) {
        currDist = texture(uDataSlot0, uv).r;
        isObastacle = texture(uDataSlot0, uv).g;
        isGoal = texture(uDataSlot0, uv).b;
        if(isObastacle==0.0) {
            float L = texture(uDataSlot0, uv + direction[0]/uGridSize).r;
            float R = texture(uDataSlot0, uv + direction[1]/uGridSize).r;
            float T = texture(uDataSlot0, uv + direction[2]/uGridSize).r;
            float B = texture(uDataSlot0, uv + direction[3]/uGridSize).r;

            float minNeighbor = min(min(L, R), min(T, B));
            currDist = min(currDist, minNeighbor + 1.0);
        }
    }

    fragData[0] = vec4(currDist, isObastacle, isGoal, 1.0);
    fragData[1] = vec4(1.0, 1.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}