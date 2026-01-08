#version 300 es
precision highp float;
precision highp int;

#value uWavefrontTexture:0
uniform sampler2D uWavefrontTexture;

#value uDataSlot0:1
uniform sampler2D uDataSlot0;    // distance.r, isObstacle.g ( 1.0 == 'obstacle' )
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

vec2 direction[8] = vec2[](
vec2(-1, 0),    // left
vec2(-1, 1),    // left-top
vec2(0, 1),     // top
vec2(1, 1),     // right-top
vec2(1, 0),     // right
vec2(1, -1),    // right-bottom
vec2(0, -1),    // bottom
vec2(-1, -1)     // left-bottom
);

out vec4[4] fragData;


void main()
{
    vec2 gridCoord = gl_FragCoord.xy - vec2(0.5);
    vec2 uv = gl_FragCoord.xy / vec2(uGridSize);

    float currentDist = texture(uWavefrontTexture, uv).r;
    float currentObs = texture(uWavefrontTexture, uv).g;

    vec2 bestDir = vec2(0.0);
    float minDist = currentDist;

    float surrDistance[8] = float[](
    texture(uWavefrontTexture, uv + direction[0]/uGridSize).r, // left
    texture(uWavefrontTexture, uv + direction[1]/uGridSize).r, // left-top
    texture(uWavefrontTexture, uv + direction[2]/uGridSize).r, // top
    texture(uWavefrontTexture, uv + direction[3]/uGridSize).r, // right-top
    texture(uWavefrontTexture, uv + direction[4]/uGridSize).r, // right
    texture(uWavefrontTexture, uv + direction[5]/uGridSize).r, // right-bottom
    texture(uWavefrontTexture, uv + direction[6]/uGridSize).r, // bottom
    texture(uWavefrontTexture, uv + direction[7]/uGridSize).r  // left-bottom
    );

    float surrObstacle[8] = float[](
    texture(uWavefrontTexture, uv + direction[0]/uGridSize).g, // left
    texture(uWavefrontTexture, uv + direction[1]/uGridSize).g, // left-top
    texture(uWavefrontTexture, uv + direction[2]/uGridSize).g, // top
    texture(uWavefrontTexture, uv + direction[3]/uGridSize).g, // right-top
    texture(uWavefrontTexture, uv + direction[4]/uGridSize).g, // right
    texture(uWavefrontTexture, uv + direction[5]/uGridSize).g, // right-bottom
    texture(uWavefrontTexture, uv + direction[6]/uGridSize).g, // bottom
    texture(uWavefrontTexture, uv + direction[7]/uGridSize).g  // left-bottom
    );

    if (currentObs < 0.5 && currentDist > 0.0) {

        for (int i = 0; i < 8; i++) {

            // Diagonals check
            bool isDiagonal = (i % 2 != 0);

            if (isDiagonal) {
                float cardinal1 = surrObstacle[(i + 7) % 8];
                float cardinal2 = surrObstacle[(i + 1) % 8];

                if (cardinal1 > 0.5 || cardinal2 > 0.5) {
                    continue;
                }
            }

            float neighborDist = surrDistance[i];

            if (neighborDist < minDist) {
                minDist = neighborDist;
                bestDir = direction[i];
            }
        }
    }


    fragData[0] = vec4(bestDir, 0.0, 1.0);
    fragData[1] = vec4(1.0, 1.0, 0.0, 1.0);
    fragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
    fragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}