precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable

#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;
#value obsSampler:2
uniform sampler2D obsSampler;
#value generatorSampler:3
uniform sampler2D generatorSampler; // particleID.x, startTime.y, percentLife.z, generation.w

#value deltaTime:0.01666
uniform float deltaTime;

uniform vec4 grid;  // width.r, height.g, corner.ba
uniform vec2 worldSize;
uniform vec2 resolution;
uniform float time;
uniform float duration;
uniform float partiCount;
uniform float geneCount;
uniform float lifeTime;

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

vec3 velField(vec3 pos, vec3 scalar) {
    float x = fract(sin(dot2(pos.xy,vec2(12.9898,78.233)))* 43758.5453)-0.5;
    float y = fract(sin(dot2(pos.xy,vec2(62.2364,94.674)))* 62159.8432)-0.5;
    float z = fract(sin(dot2(pos.xy,vec2(989.2364,94.674)))* 12349.8432)-0.5;

    return scalar*normalize(vec3(x,y,z));
}

void updatePosVel(inout vec3 pos, inout vec3 vel, vec3 acc, vec2 obs, vec2 index) {
    pos = pos + vel * deltaTime;
    vel = vel + acc * deltaTime;
    float width = worldSize.x / 2.0;
    float height = worldSize.y / 2.0;
    int n = int(index.x+1.0 + index.y*resolution.x);
    vec2 random = vec2(halton(2, n), halton(3, n));
    // reset pos if particle out
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

void main() {

    vec3 gravity = vec3(0, -10, 0);

    vec2 uv = gl_FragCoord.xy / resolution;    

    vec3 pos = texture2D(posSampler, uv).xyz;
    vec3 vel = texture2D(velSampler, uv).xyz;
    float size = texture2D(posSampler, uv).w;

    float particleID = texture2D(generatorSampler, uv).x;
    float startTime = texture2D(generatorSampler, uv).y;
    float percentLife = texture2D(generatorSampler, uv).z;
    float generation = texture2D(generatorSampler, uv).w;

    vec4 obstacle = texture2D(obsSampler, (pos.xy + 0.5*worldSize)/worldSize);
    vec2 obs = vec2(obstacle.x, obstacle.y)*2.0 - 1.0;

    float localTime = time - startTime;
    percentLife = localTime / lifeTime;

    if(localTime > 0.0) {
        updatePosVel(pos, vel, gravity, obs, gl_FragCoord.xy);
    }
    // vel = vel+velField(pos,vec3(0.5,.2,0.5));

    gl_FragData[0] = vec4(pos,size);
    gl_FragData[1] = vec4(vel,1); 
    gl_FragData[2] = vec4(particleID, startTime, percentLife, generation);
    gl_FragData[3] = vec4(0.01, 0.01, 0.02,1);

}