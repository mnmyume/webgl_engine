precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable
#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;
#value obsSampler:2
uniform sampler2D obsSampler;

#value deltaTime:0.01666
uniform float deltaTime;
#value center:(0,0)
uniform vec2 center;

uniform vec2 resolution;
uniform vec2 worldSize;
uniform float randSeed;   // (-1,1)

float random(float seed) {
    return fract(sin(seed)*10000.0);
}

void updatePosVel(inout vec2 pos, inout vec2 vel, vec2 acc, vec2 obs, vec2 index) {
    pos = pos + vel * deltaTime;
    vel = vel + acc * deltaTime; 
    float width = worldSize.x / 2.0;
    float height = worldSize.y / 2.0;
    // reset pos if particle out
    if(abs(pos.x) > width || abs(pos.y) > height){
        pos.y = height + randSeed-1.0;
        pos.x = mod(pos.x + randSeed * 100.0, width*2.0) - width;
        vel.x = randSeed * 5.0;
        vel.y = (randSeed - 1.0 + index.y)*60.0;
    }
    // obstacle
    if (obs.y > 0.0) {
        pos = pos - vel * deltaTime;
        pos = pos + obs;
        if (length(vel) < 0.5) {
            vel = obs * 0.5; // velocity too low, jiggle outward
        } else {
            vel = reflect(vel, obs) * 0.25; // bounce, restitution
        }
    }
}

void main() {

    vec2 gravity = vec2(0, -50);

    vec2 uv = gl_FragCoord.xy / resolution;    

    vec4 position = texture2D(posSampler, uv);
    vec4 velocity = texture2D(velSampler, uv);
    vec2 pos = vec2(position.x, position.y);
    vec2 vel = vec2(velocity.x, velocity.y);

    vec4 obstacle = texture2D(obsSampler, (pos + 0.5*worldSize)/worldSize);
    vec2 obs = vec2(obstacle.x, obstacle.y)*2.0 - 1.0;

    updatePosVel(pos, vel, gravity, obs, uv);

    gl_FragData[0] = vec4(pos,0,1);
    gl_FragData[1] = vec4(vel,0,1); 
    gl_FragData[2] = vec4(0, randSeed, 0, 1);
    gl_FragData[3] = vec4(0.01, 0.01, 0.02,1);

}