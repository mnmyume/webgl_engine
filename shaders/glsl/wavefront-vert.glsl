#version 300 es
#define DISTANCE_LOCATION 0
#define OBSTACLE_LOCATION 1

precision highp float;
precision highp int;

#buffer aDistance:wavefrontBuffer, size:1, stride:8, offset:0
layout(location = DISTANCE_LOCATION) in float aDistance;

#buffer aObstacle:wavefrontBuffer, size:1, stride:8, offset:4
layout(location = OBSTACLE_LOCATION) in float aObstacle;

#value uState:0
uniform int uState; // 1: init mode, 2: play mode
#value uLoop:true
uniform bool uLoop;

#value uGoal:[0,0]
uniform vec2 uGoal;
uniform int uGridSize;

out float vDistance;
out float vObstacle;

ivec2 offsets[4] = ivec2[](
    ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1)
);

void main() {

    float distance = aDistance;
//    distance = float(gl_InstanceID);
    float obstacle = aObstacle;
    int gridSize = uGridSize;

    int row = gl_InstanceID / gridSize;
    int col = gl_InstanceID % gridSize;
    ivec2 coord = ivec2(row, col);

//    for(int i = 0; i < 4; i++) {
//        ivec2 neighborCoord = coord + offsets[i];
//
//        // Read neighbor distance
//        float nDist = texelFetch(u_texture, neighborCoord, 0).r;
//
//        // If neighbor is valid (not a wall, not infinity)
//        if (nDist > -0.5 && nDist < 99990.0) {
//            // Wavefront Logic: My distance is Neighbor + 1
//            float newDist = nDist + 1.0;
//
//            // Keep the smallest distance found
//            if (newDist < bestDist) {
//                bestDist = newDist;
//            }
//        }
//    }



    gl_Position = vec4(3.0, 4.0, 0, 1.0);

    vDistance = distance;
    vObstacle = obstacle;
}
