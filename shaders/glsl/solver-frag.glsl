precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable

#value emitterSampler:0
uniform sampler2D emitterSampler;      // X: posX,   Y: posZ,    Z: size,      w:startTime

#value posFB:1                      //// x:posX,        y:posY,         z:posZ          w:size
uniform sampler2D posFB;
#value velFB:2                       //// x:velX,        y:velY,         z:velZ          w:alpha
uniform sampler2D velFB;

#value deltaTime:0.01666
uniform float deltaTime;

#value emitter_transform:mat4(1.0)
uniform mat4 emitter_transform;

uniform vec4 grid;  // width.r, height.g, corner.ba
uniform vec2 worldSize;
uniform vec2 resolution;
uniform float time;         //gameTime
#value state:0
uniform int state;  // state = 1, init mode
                    // state = 2, play mode
// #value duration:-1
uniform float duration; // -1 infinite
uniform float geneCount;
uniform float lifeTime;
uniform float partiCount;

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

void updatePosVel(inout vec3 pos, inout vec3 vel, vec2 obs, vec2 index) {
    pos = pos + vel * deltaTime;
    
    // reset pos if particle out boundary
    // float width = worldSize.x / 2.0;
    // float height = worldSize.y / 2.0;
    // int n = int(index.x+1.0 + index.y*resolution.x);
    // vec2 random = vec2(halton(2, n), halton(3, n));
    // if(abs(pos.x) > width || abs(pos.y) > height){
    //     pos.y = grid.g; 
    //     pos.z = grid.a + grid.r * random.y;
    //     pos.x = grid.b + grid.r * random.x; 
    //     vel.x = 0.0;    
    //     vel.y = 0.0;    
    // }

    // obstacle
    if (obs.y > 0.0) {
        pos.xy = pos.xy - vel.xy * deltaTime;
        pos.xy = pos.xy + obs;
        if (length(vel) < 0.5) {
            vel.xy = obs * 0.5; // velocity too low, jiggle outward
        } else {
            vel.xy = reflect(vel.xy, obs) * 0.25; // bounce, restitution
        }
    }
}

const float NUM_COMPONENTS = 1.0;
float pidPixels(float pid){
  return  pid*NUM_COMPONENTS;
}
//vec2 getPropertyCoord(float pid, float offset){
//  return  vec2(pid*NUM_COMPONENTS + offset + 0.5, 0.5);
//}
vec2 getEmitterCoord(float pid, float generation){
    return vec2(0.0);
}
vec2 getEmitterStartTimeCoord(float pid, float MAXCOL){
    return vec2( pid/ (1.0/MAXCOL)       ,0.0);
}
vec2 getSolverCoord(int pid, int MAXCOL){
    return vec2(pid%MAXCOL,   floor(pid/MAXCOL));
}
int getPID(uv){
    return 0;
}


void main() {

    vec2 uv = vec2(0.5,0.5);//gl_FragCoord.xy / resolution;

    int particleID = getPID(uv);
    vec2 solverUV = getSolverCoord();


    // read position and velocity from texture
//    float componentOffset = 0.0;
//    vec2 particlePropertyCoord = getPropertyCoord(particleID, componentOffset) / pidPixels(partiCount);
    
    
    vec3 pos = vec3(0.0);

    if(state == 1){//emit


        float generation = 0.0;
        vec2 coord = vec2(0.5,0.5);//getEmitterCoord(generation);
        vec2 emitterPos =   texture2D(emitterSampler, coord).xy;
        float emitterSize =        texture2D(emitterSampler, coord).z;

        pos = (emitter_transform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;
    }else if(state == 2){ //solver

        pos = texture2D(posFB, solverUV).xyz;

        if(1){ //restart
            float startTime =   texture2D(emitterSampler, getEmitterStartTimeCoord).w;
            float localTime = mod(time - startTime, lifeTime) ;
            float percentLife = localTime / lifeTime;
            float frame = mod(floor(localTime / frameDuration), numFrames);
            float generation = 0; // floor((time - startTime) / duration);

            vec2 coord = vec2(0.5,0.5);//getEmitterCoord(generation);
            vec2 emitterPos =   texture2D(emitterSampler, coord).xy;
            float emitterSize =        texture2D(emitterSampler, coord).z;
            pos = (emitter_transform * vec4(emitterPos.x, 0, emitterPos.y, 1)).xyz;

        }



    }

    vec3 pos = position.xyz;

    
    vec3 vel = texture2D(velFB, texCoord).xyz;

    vec4 obstacle = texture2D(obsSampler, (pos.xy + 0.5*worldSize)/worldSize);
    vec2 obs = vec2(obstacle.x, obstacle.y)*2.0 - 1.0;

    float localTime = 0.0;
    if(time - startTime > 0.0) {
        localTime = mod(time - startTime, lifeTime);
    }

    percentLife = localTime / lifeTime;

    if(localTime > 0.0 && percentLife < 1.0) {
        vel = gravityField(vel);
        vel = vel + velField(pos, vec3(.0,.0,.0));
        updatePosVel(pos, vel, obs, gl_FragCoord.xy);
    }


    bool isEmitterActive = duration > 0.0 && time < duration;
    if(percentLife > 1.0 && isEmitterActive){   // particle is dead
        //read emitter texture map
        generation = floor((time - startTime)/lifeTime);
        texCoordV = 1.0 - (generation / geneCount + 0.5 / geneCount);
        texCoord = vec2(texCoordU, texCoordV);
        pos = texture2D(emitterSampler, texCoord).xyz;
        vel = texture2D(velFB, texCoord).xyz;
    }


    gl_FragData[0] = vec4(0,10,0, emitterSize);
    gl_FragData[1] = vec4(vel, 1);
    gl_FragData[2] = vec4(particleID, startTime, percentLife, generation);
    gl_FragData[3] = vec4(1.0,.0,.0,1.0);

}