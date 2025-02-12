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

uniform vec4 grid;  // width.x, height.y, corner.zw
uniform vec2 resolution;
uniform vec2 worldSize;
uniform float randSeed;   // (-1,1)

vec2 circleVelocityField(vec2 position) {
    
    float distance = length(position); 
    float angle = atan(position.y, position.x);  

    float speed = 0.1 * distance; 
    float vx = -speed * sin(angle);  
    float vy = speed * cos(angle);   
    
    return vec2(vx, vy); 
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

void updatePosVel(inout vec2 pos, inout vec2 vel, vec2 acc, vec2 obs, vec2 index) {
    pos = pos + vel * deltaTime;
    vel = vel + acc * deltaTime; 
    float width = worldSize.x / 2.0;
    float height = worldSize.y / 2.0;
    int n = int(index.x+1.0 + index.y*resolution.x);
    vec2 random = vec2(halton(2, n), halton(3, n));
    // reset pos if particle out
    if(abs(pos.x) > width || abs(pos.y) > height){
        pos.y = grid.w + grid.y * random.y; 
        pos.x = grid.z + grid.x * random.x; 
        vel.x = randSeed * 5.0;
        vel.y = (randSeed - 1.0 + index.y/resolution.y)*60.0;
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

    updatePosVel(pos, vel, gravity, obs, gl_FragCoord.xy);

    gl_FragData[0] = vec4(pos,0,1);
    gl_FragData[1] = vec4(vel,0,1); 
    gl_FragData[2] = vec4(0, randSeed, 0, 1);
    gl_FragData[3] = vec4(0.01, 0.01, 0.02,1);

}