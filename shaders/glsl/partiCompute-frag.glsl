precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable
#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;

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

void updatePosVel(inout vec2 pos, inout vec2 vel, vec2 acc) {
    pos = pos + vel * deltaTime;
    vel = vel + acc * deltaTime; 
    float width = worldSize.x / 2.0;
    float height = worldSize.y / 2.0;
    // reset pos if particle out
    if(abs(pos.x) > width || abs(pos.y) > height){
        pos.y = height;
        pos.x = mod(pos.x + randSeed * 10.0, width*2.0) - width;
        vel.x = vel.x + randSeed*5.0;
        vel.y = 0.0;
    }
}

void main() {

    float width = worldSize.x / 2.0;
    float height = worldSize.y / 2.0;

    vec2 gravity = vec2(0, -10);

    vec2 uv = gl_FragCoord.xy / resolution;    

    vec4 position = texture2D(posSampler, uv);
    vec4 velocity = texture2D(velSampler, uv);
    vec2 pos = vec2(position.x, position.y);
    vec2 vel = vec2(velocity.x, velocity.y);
    updatePosVel(pos, vel, gravity);

    gl_FragData[0] = vec4(pos,0,1);
    gl_FragData[1] = vec4(vel,0,1); 
    gl_FragData[2] = vec4(0, randSeed, 0, 1);
    gl_FragData[3] = vec4(0.01, 0.01, 0.02,1);

}