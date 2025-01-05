precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable
#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;

#value deltaTime:0.01666
uniform float deltaTime;

#value center:0,0
uniform vec2 center;

varying vec2 vUV;

vec2 velocityField(vec2 position) {

    vec2 offset = position - center;
    vec2 r = normalize(offset);

    float velScalar = 20.0;
    
    return velScalar * vec2(-r.y, r.x);
}

void main() {

    vec2 gravity = vec2(0.0, -10.0);

    vec2 uv = gl_FragCoord.xy / 512.0;    // TODO: change to uniform/value

    vec4 position = texture2D(posSampler, uv);
    vec4 velocity = texture2D(velSampler, uv);
    vec2 pos = vec2(position.x, position.y);
    vec2 vel = vec2(velocity.x, velocity.y);
    vec2 newVel = vel + gravity*deltaTime;
    vec2 newPos =  pos + deltaTime * newVel;


    gl_FragData[0] = vec4(newPos,0,1);
    gl_FragData[1] = vec4(newVel,0,1); 
    gl_FragData[2] = vec4(uv, 0, 1);
    gl_FragData[3] = vec4(0, 0.7, 0,1);

}