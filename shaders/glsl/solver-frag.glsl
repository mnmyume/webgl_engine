precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable

#define GEN_SIZE 2

#value uEmitterSlot0:[0,1]
uniform sampler2D uEmitterSlot0[GEN_SIZE];      // posX, posZ, size, startTime
#value uEmitterSlot1:[2,3]
uniform sampler2D uEmitterSlot1[GEN_SIZE];      // linVelX, linVelY, linVelZ, _empty
#value uEmitterSlot2:[4,5]
uniform sampler2D uEmitterSlot2[GEN_SIZE];      // angVelX, angVelZ, _empty, _empty

//#value test[0]:vec4( -1.0)
//#value test[1]:[4, 5, 6, 7]
//#value test[2]:[8, 9, 10, 11]
//#value test[3]:[12, 13, 14, 15]
//uniform vec4 test[GEN_SIZE];      // posX, posZ, size, startTime

#value uDataSlot0:6
uniform sampler2D uDataSlot0;    // posX, posY, posZ, size
#value uDataSlot1:7
uniform sampler2D uDataSlot1;    // velX, velY, velZ, generation
#value uDataSlot2:8
uniform sampler2D uDataSlot2;    // rotX, rotZ, percentLife, ____
#value uDataSlot3:9
uniform sampler2D uDataSlot3;    // colorX, colorY, colorZ, ____

#value uDeltaTime:0.01666
uniform float uDeltaTime;

#value uEmitterTransform:mat4(1.0)
uniform mat4 uEmitterTransform;

#value uState:0
uniform int uState;  // uState = 1, init mode; uState = 2, play mode
// #value uLoop:true
uniform bool uLoop;

uniform float uTime;         //gameTime

// #value uDuration:-1
uniform float uDuration; // -1 infinite
uniform float uGeneCount;
uniform float uLifeTime;
uniform float uPartiCount;
uniform float uMAXCOL;

uniform vec4 uGrid;  // width.r, height.g, corner.ba
uniform vec2 uWorldSize;
uniform vec2 uResolution;

#define PARMS 4
#value uFieldParams:[vec4(0),vec4(1),vec4(0),vec4(0)]    // 0: switcher.x, gravity.yzw;
                                                        // 1: switcher.x, vortexScalar.y, __, __;
uniform vec4 uFieldParams[PARMS];                        // 2: switcher.x, noiseScalar.yzw;
                                                        // 3: switcher.x, dampScalar.y, __, __;

float dot2(vec2 a, vec2 b) {
    return a.x * b.x + a.y * b.y;
}

float halton(int base, int index) {
    float result = 0.0;
    float digitWeight = 1.0;
    digitWeight = digitWeight / float(base); 
    int nominator;
    for (int i = 0; i < 10; i++) {
        nominator = index - (index / base) * base;  // int mod
        result += float(nominator) * digitWeight;
        index = index / base;
        digitWeight = digitWeight / float(base);
        if (index == 0) {
            break;
        }
    }
    return result;
}

vec3 gravityField(vec3 linVel, vec3 gravity) {
    linVel = linVel + gravity * uDeltaTime;
    return linVel;
}

vec3 vortexField(vec3 pos, float scalar){   //vec3 axis, needs Quaternion Helper
    vec3 linVel = vec3(-pos.z,0, pos.x)*scalar;
    return linVel;
}

vec3 noiseField(vec3 pos, vec3 scalar) {

    float x = fract(sin(dot2(pos.xy,vec2(12.9898,78.233)))* 43758.5453)-0.5;
    float y = fract(sin(dot2(pos.xy,vec2(62.2364,94.674)))* 62159.8432)-0.5;
    float z = fract(sin(dot2(pos.xy,vec2(989.2364,94.674)))* 12349.8432)-0.5;

    vec3 d = vec3(x,y,z);

    return scalar*normalize(d);
}
vec3 damp(vec3 linVel, float k, float dTime){
    return linVel*(1.0-k);
}

void updatePosVel(inout vec3 pos, inout vec3 linVel) { // vec2 obs, vec2 index
    pos = pos + linVel * uDeltaTime;
    
//    // reset pos if particle out boundary
//     float width = uWorldSize.x / 2.0;
//     float height = uWorldSize.y / 2.0;
//     int n = int(index.x+1.0 + index.y*uResolution.x);
//     vec2 random = vec2(halton(2, n), halton(3, n));
//     if(abs(pos.x) > width || abs(pos.y) > height){
//         pos.y = uGrid.g;
//         pos.z = uGrid.a + uGrid.r * random.y;
//         pos.x = uGrid.b + uGrid.r * random.x;
//         linVel.x = 0.0;
//         linVel.y = 0.0;
//     }
//
//    // obstacle
//    if (obs.y > 0.0) {
//        pos.xy = pos.xy - linVel.xy * uDeltaTime;
//        pos.xy = pos.xy + obs;
//        if (length(linVel) < 0.5) {
//            linVel.xy = obs * 0.5; // velocity too low, jiggle outward
//        } else {
//            linVel.xy = reflect(linVel.xy, obs) * 0.25; // bounce, restitution
//        }
//    }
}

const float NUM_COMPONENTS = 1.0;
float pidPixels(float pid){
  return  pid*NUM_COMPONENTS;
}

//vec2 getEmitterCoord(float pid, float generation, float uPartiCount, float uGeneCount){
//    return vec2(pid/uPartiCount+0.5, generation/uGeneCount+0.5);
//}
vec2 getEmitterCoord(float pid, float uMAXCOL){
    vec2 uv = vec2(mod(pid,uMAXCOL), floor(pid/uMAXCOL))/uMAXCOL;
    uv += vec2(1.0/uMAXCOL*0.5); //  offset to center of pixel
    return uv;
}

//https://registry.khronos.org/OpenGL-Refpages/gl4/html/gl_FragCoord.xhtml
// lower-left origin
float getPID(vec2 fragCoord, float uMAXCOL){
    return (uMAXCOL-1.0-floor(fragCoord.y)) * uMAXCOL + floor(fragCoord.x);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    float particleID = getPID(gl_FragCoord.xy, uMAXCOL);

    vec3 pos;
    vec3 linVel;
    vec2 angVel;
    float size = 0.0;
    int lastGene = int(texture2D(uDataSlot1, uv).w);
    vec2 emitterUV = getEmitterCoord(particleID,uMAXCOL);
    float startTime = texture2D(uEmitterSlot0[0], emitterUV).w;
    vec3 partiCol = vec3(1.0, 1.0, 1.0);
    float localTime = uTime - startTime > 0.0 ? mod(uTime - startTime, uLifeTime) : 0.0;
    float percentLife = localTime / uLifeTime;
    int generation = uTime - startTime > 0.0 ? int(mod(floor((uTime - startTime)/uLifeTime), float(GEN_SIZE))) : -1;

    bool emit = generation != lastGene;
    bool hibernate = generation == -1;


    if(!hibernate && emit){
        if(uState == 1 || uLoop){
            vec2 emitterPos = vec2(0,0);
            if(generation == 0){
                emitterPos = texture2D(uEmitterSlot0[0], emitterUV).xy;
                linVel = texture2D(uEmitterSlot1[0], emitterUV).xyz;
            }else if(generation == 1){
                emitterPos = texture2D(uEmitterSlot0[1], emitterUV).xy;
                linVel = texture2D(uEmitterSlot1[1], emitterUV).xyz;
            }
//            else if(generation == 2)
//                emitterPos = texture2D(uEmitterSlot0[2], emitterUV).xy;
//            else if(generation == 3)
//                emitterPos = texture2D(uEmitterSlot0[3], emitterUV).xy;

            pos = (uEmitterTransform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
            linVel = vec3(0);
        }

    }

    ////////////////////////////INTEGRATION-----UPDATE
    else if(!hibernate && localTime>0.0){

        pos = texture2D(uDataSlot0, uv).xyz;
        vec3 oldVel = texture2D(uDataSlot1, uv).xyz;
        size = texture2D(uEmitterSlot0[0], emitterUV).z;

        float gravitySwitcher = uFieldParams[0].x;
        vec3 gravity = uFieldParams[0].yzw;
        float vortexSwitcher = uFieldParams[1].x;
        float vortexScalar = uFieldParams[1].y;
        float noiseSwitcher = uFieldParams[2].x;
        vec3 noiseScalar = uFieldParams[2].yzw;
        float dampSwitcher = uFieldParams[3].x;
        float dampScalar = uFieldParams[3].y;

        if(gravitySwitcher == 1.0) {
            linVel = gravityField(oldVel, gravity);
        }
        if(vortexSwitcher == 1.0) {
            linVel += vortexField(pos, vortexScalar);
        }
        if(noiseSwitcher == 1.0) {
            linVel  += noiseField(pos, noiseScalar);
        }
        if(dampSwitcher == 1.0){
            linVel = oldVel + damp(linVel-oldVel, dampScalar, uDeltaTime);
        }

        updatePosVel(pos, linVel);
    }

    gl_FragData[0] = vec4(pos, size);
    gl_FragData[1] = vec4(linVel, generation);
    gl_FragData[2] = vec4(angVel, percentLife, 1.0);
    gl_FragData[3] = vec4(partiCol, 1.0);

}
