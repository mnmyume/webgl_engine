precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable

#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;
#value propertySampler:2
uniform sampler2D propertySampler; // particleID.x, startTime.y, percentLife.z, generation.w
#value obsSampler:3
uniform sampler2D obsSampler;

#value deltaTime:0.01666
uniform float deltaTime;

uniform vec4 grid;  // width.r, height.g, corner.ba
uniform vec2 worldSize;
uniform vec2 resolution;
uniform float time;

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
float pidPixelsOffset(float pid, float offset){
  return  pid*NUM_COMPONENTS + offset + 0.5;
}

void main() {

    vec2 uv = gl_FragCoord.xy / resolution;    

    float particleID = texture2D(propertySampler, uv).x;
    float startTime = texture2D(propertySampler, uv).y;
    float percentLife = texture2D(propertySampler, uv).z;
    float generation = texture2D(propertySampler, uv).w;

    // read position and velocity from texture
    float componentOffset = 0.0;
    float texCoordU = pidPixelsOffset(particleID, componentOffset) / pidPixels(partiCount);
    float texCoordV = 0.5;  
    vec2 texCoord = vec2(texCoordU, texCoordV);

    vec3 pos = texture2D(posSampler, texCoord).xyz;
    vec3 vel = texture2D(velSampler, texCoord).xyz;
    float size = texture2D(posSampler, texCoord).w;

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
        pos = texture2D(posSampler, texCoord).xyz;
        vel = texture2D(velSampler, texCoord).xyz;
    }


    gl_FragData[0] = vec4(0.0,0.0,1.0,1.0);
    gl_FragData[1] = vec4(vel,1); 
    gl_FragData[2] = vec4(particleID, startTime, percentLife, generation);
    gl_FragData[3] = vec4(0.01, 0.01, 0.02,1);

}