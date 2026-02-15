#version 300 es
precision mediump float;
precision mediump int;

#value uTexCellSize:48
uniform float uTexCellSize;
uniform mat4 _uni_viewMat;
uniform mat4 _uni_projMat;

out vec4 vTexBoundary;

#value uAniFPS:16.0
uniform float uAniFPS;
uniform float uTime;

#value uPosition:vec2(0)
uniform vec2 uPosition;
#value uDepth:-2.0
uniform float uDepth;


#value uPixelOffsetY:32.0
uniform float uPixelOffsetY;

#value uTexBoundarySize:vec2(1,2)
uniform vec2 uTexBoundarySize;

#value uScale:1.0
uniform float uScale;

#value uAniSeq:14
uniform float uAniSeq;

#value uOffset:vec3(0)
uniform vec3 uOffset;


#value uCanvasMode:2048
uniform int uCanvasMode;

#value uUnitSize:1
uniform float uUnitSize;

#value uBoidsTexture0:0
uniform sampler2D uBoidsTexture0;
#value uBoidsTexture1:1
uniform sampler2D uBoidsTexture1;

vec2 getEmitterCoord(float particleID, float gridSize) {
    vec2 uv = vec2(mod(particleID,gridSize), floor(particleID/gridSize))/gridSize;
    uv += vec2(1.0/gridSize*0.5);    //  offset to center of pixel
    return uv;
}

float getAniType(vec2 vel) {
    // 0: Right, 1: Left, 2: Down, 3: Up
    if (abs(vel.x) > abs(vel.y)) {
        return (vel.x > 0.0) ? 0.0 : 1.0;
    }
    else {
        if (vel.y == 0.0 && vel.x == 0.0) return 0.0;

        return (vel.y > 0.0) ? 3.0 : 2.0;
    }
}

void main(void) {

    float particleID = float(gl_InstanceID);
    vec2 emitterUV = getEmitterCoord(particleID, uEmitterTexSize);

    vec4 boidsData0 = texture(uBoidsTexture0,emitterUV);
    vec4 boidsData1 = texture(uBoidsTexture1,emitterUV);
    vec2 pos = boidsData0.xy;
    vec2 vel = boidsData0.zw;
    float aniType = getAniType(vel);
    float frameLife = boidsData1.y;

    int aniIndexX = int(uTime*uAniFPS*uTexBoundarySize.x);
    int aniIndexY = int(uAniSeq*uTexBoundarySize.y);
    vTexBoundary = vec4(aniIndexX,aniIndexY,uTexBoundarySize.x,uTexBoundarySize.y);

//    vec2 texIndex = vTexBoundary.xy;
//    vec2 texSize  = vTexBoundary.zw*uScale;
//    vec2 offset = vec2(0,uPixelOffsetY/uTexCellSize*uUnitSize*uScale);
//    vec3 position = CANVAS_TRANSFORM(uCanvasMode|MODE_CHAR, uUnitSize, vec3(uPosition, uDepth), uv,texSize,offset);


//    gl_Position = _uni_projMat * _uni_viewMat * vec4(position+uOffset, 1.0);
    gl_Position = _uni_projMat * _uni_viewMat * vec4(pos, 0.0, 1.0);
    gl_PointSize = 100.0;

}
