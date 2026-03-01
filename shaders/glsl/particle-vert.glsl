#version 300 es
precision highp float;
precision highp int;

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#value uBoidsTexture0:0
uniform sampler2D uBoidsTexture0;
#value uBoidsTexture1:1
uniform sampler2D uBoidsTexture1;

uniform float uEmitterTexSize;

out float vAniType;
out float vFrameLife;

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

void main()
{
    float particleID = float(gl_InstanceID);
    vec2 emitterUV = getEmitterCoord(particleID, uEmitterTexSize);

    vec4 boidsData0 = texture(uBoidsTexture0,emitterUV);
    vec4 boidsData1 = texture(uBoidsTexture1,emitterUV);
    vec2 pos = boidsData0.xy;
    vec2 vel = boidsData0.zw;
    float aniType = getAniType(vel);
    float frameLife = boidsData1.y;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(pos, 0, 1);
    gl_PointSize = 10.0;

    vAniType = aniType;
    vFrameLife = frameLife;
}
