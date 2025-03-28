precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable

#define GEN_SIZE 4

#value emitterArr:[0,1,2,3]
uniform sampler2D emitterArr[GEN_SIZE];      // posX, posZ, size, startTime

//uniform sampler2DArray emitterArrTest;
#value test[0]:vec4( -1.0)
#value test[1]:[4, 5, 6, 7]
#value test[2]:[8, 9, 10, 11]
#value test[3]:[12, 13, 14, 15]
uniform vec4 test[GEN_SIZE];      // posX, posZ, size, startTime

#value posFB:4
uniform sampler2D posFB;    // posX, posY, posZ, size
#value velFB:5
uniform sampler2D velFB;    // velX, velY, velZ, alpha

#value deltaTime:0.01666
uniform float deltaTime;

#value emitter_transform:mat4(1.0)
uniform mat4 emitter_transform;

#value state:0
uniform int state;  // state = 1, init mode; state = 2, play mode

uniform float time;         //gameTime

// #value duration:-1
uniform float duration; // -1 infinite
uniform float geneCount;
uniform float lifeTime;
uniform float partiCount;
uniform float MAXCOL;

uniform vec4 grid;  // width.r, height.g, corner.ba
uniform vec2 worldSize;
uniform vec2 resolution;

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

vec3 gravityField(vec3 vel) {
    vec3 gravity = vec3(0, -10, 0);
    vel = vel + gravity * deltaTime;
    
    return vel;
}

vec3 velField(vec3 pos, vec3 scalar) {
    float x = fract(sin(dot2(pos.xy,vec2(12.9898,78.233)))* 43758.5453)-0.5;
    float y = fract(sin(dot2(pos.xy,vec2(62.2364,94.674)))* 62159.8432)-0.5;
    float z = fract(sin(dot2(pos.xy,vec2(989.2364,94.674)))* 12349.8432)-0.5;

    float randomMagnitude1 = sin(time*2.5)*0.7;
    float randomMagnitude2 = cos(time*2.5)*0.7;

    vec3 d = vec3(x*sin(y),y,z)*randomMagnitude1 + vec3(y,x,z)*randomMagnitude2;

    return scalar*normalize(d);
}

void updatePosVel(inout vec3 pos, inout vec3 vel) { // vec2 obs, vec2 index
    pos = pos + vel * deltaTime;
    
//    // reset pos if particle out boundary
//     float width = worldSize.x / 2.0;
//     float height = worldSize.y / 2.0;
//     int n = int(index.x+1.0 + index.y*resolution.x);
//     vec2 random = vec2(halton(2, n), halton(3, n));
//     if(abs(pos.x) > width || abs(pos.y) > height){
//         pos.y = grid.g;
//         pos.z = grid.a + grid.r * random.y;
//         pos.x = grid.b + grid.r * random.x;
//         vel.x = 0.0;
//         vel.y = 0.0;
//     }
//
//    // obstacle
//    if (obs.y > 0.0) {
//        pos.xy = pos.xy - vel.xy * deltaTime;
//        pos.xy = pos.xy + obs;
//        if (length(vel) < 0.5) {
//            vel.xy = obs * 0.5; // velocity too low, jiggle outward
//        } else {
//            vel.xy = reflect(vel.xy, obs) * 0.25; // bounce, restitution
//        }
//    }
}

const float NUM_COMPONENTS = 1.0;
float pidPixels(float pid){
  return  pid*NUM_COMPONENTS;
}

//vec2 getEmitterCoord(float pid, float generation, float partiCount, float geneCount){
//    return vec2(pid/partiCount+0.5, generation/geneCount+0.5);
//}
vec2 getEmitterCoord(float pid, float MAXCOL){
    vec2 uv = vec2(mod(pid,MAXCOL), floor(pid/MAXCOL))/MAXCOL;
    uv += vec2(1.0/MAXCOL*0.5); //  offset to center of pixel
    return uv;
}

//https://registry.khronos.org/OpenGL-Refpages/gl4/html/gl_FragCoord.xhtml
// lower-left origin
float getPID(vec2 fragCoord, float MAXCOL){
    return (MAXCOL-1.0-floor(fragCoord.y)) * MAXCOL + floor(fragCoord.x);
}


void main() {
    vec2 uv = gl_FragCoord.xy / resolution;

    bool loop = true;

    int generation = 0;

    float particleID = getPID(gl_FragCoord.xy, MAXCOL);

    vec3 pos = vec3(0,0,0);
    vec3 vel = vec3(0,0,0);
    vec2 emitterUV = getEmitterCoord(particleID,MAXCOL);
    float size = texture2D(emitterArr[0], emitterUV).z;
    float startTime = texture2D(emitterArr[0], emitterUV).w;
    float localTime = 0.0;
    if(time - startTime > 0.0)
        localTime = mod(time - startTime, lifeTime);
    float percentLife = localTime / lifeTime;

    if(state == 1){
        vec2 emitterPos = texture2D(emitterArr[0], emitterUV).xy;
        pos = (emitter_transform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
    }else{
        pos = texture2D(posFB, uv).xyz;
        vel = texture2D(velFB, uv).xyz;
    }

    bool alive = localTime > 0.0 && time - startTime <= lifeTime;
    bool dead = time - startTime >= lifeTime;
    if(alive) {
        vel = gravityField(vel);
        vel = vel + velField(pos, vec3(.0,.0,.0));
        updatePosVel(pos, vel);
    }else if(dead){
        if(!loop) {
            size = 0.0;
        } else {
            vec2 emitterPos = vec2(0,0);
            generation = int(mod(floor((time - startTime)/lifeTime), float(GEN_SIZE)));
            generation = 1;
            if(generation == 0)
                emitterPos = texture2D(emitterArr[0], emitterUV).xy;
            else if(generation == 1)
                emitterPos = texture2D(emitterArr[1], emitterUV).xy;
            else if(generation == 2)
                emitterPos = texture2D(emitterArr[2], emitterUV).xy;
            else if(generation == 3)
                emitterPos = texture2D(emitterArr[3], emitterUV).xy;

            pos = (emitter_transform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
        }
    }


//    if(state == 1){//emit
//
//
////        vec2 emitterUV = getEmitterCoord(particleID,MAXCOL);
////
////        vec2 emitterPos = texture2D(emitterArr[0], emitterUV).xy;
////        size = texture2D(emitterArr[0], emitterUV).z;
////        startTime = texture2D(emitterArr[0], emitterUV).w;
//
//        pos = (emitter_transform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
//
//    }
//    else if(state == 2){ //solver
//
//        vec2 solverUV = getEmitterCoord(particleID, MAXCOL);
//        pos = texture2D(posFB, solverUV).xyz;
//        vel = texture2D(velFB, solverUV).xyz;
//
//        if(false){ //restart
////            float startTime = texture2D(emitterArr[0], emitterUV).w;
////            float localTime = mod(time - startTime, lifeTime) ;
////            float percentLife = localTime / lifeTime;
////            // float frame = mod(floor(localTime / frameDuration), numFrames);
////            float generation = 0.0; // floor((time - startTime) / duration);
////
////            vec2 coord = vec2(0.5,0.5);//getEmitterCoord(generation);
////            vec2 emitterPos =   texture2D(emitterArr[0], coord).xy;
////            float emitterSize =        texture2D(emitterArr[0], coord).z;
////            pos = (emitter_transform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
//
//        }
//    }
//
////    vec4 obstacle = texture2D(obsSampler, (pos.xy + 0.5*worldSize)/worldSize);
////    vec2 obs = vec2(obstacle.x, obstacle.y)*2.0 - 1.0;
//

//
//    float percentLife = localTime / lifeTime;
//
//    if(localTime > 0.0 && percentLife < 1.0) {
//        vel = gravityField(vel);
//        vel = vel + velField(pos, vec3(.0,.0,.0));
//        updatePosVel(pos, vel);
//    }
//
////    bool isEmitterActive = duration > 0.0 && time < duration;
////    if(percentLife > 1.0 && isEmitterActive){   // particle is dead
////        //read emitter texture map
////        float generation = floor((time - startTime)/lifeTime);
////        float texCoordU = 0.5;
////        float texCoordV = 1.0 - (generation / geneCount + 0.5 / geneCount);
////        vec2 texCoord = vec2(texCoordU, texCoordV);
////        pos = texture2D(emitterArr[0], texCoord).xyz;
////        vel = texture2D(velFB, texCoord).xyz;
////    }

    gl_FragData[0] = vec4(pos, size);
    gl_FragData[1] = vec4(vel, 1);
    gl_FragData[2] = vec4(generation/4, 0.0, 0.0, 1.0);
    gl_FragData[3] = vec4(1.0, 0.0, 0.0,1.0);

}
