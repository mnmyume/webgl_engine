precision highp float;
#extension GL_EXT_draw_buffers : require
#extension GL_OES_texture_float : enable
#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;

#value deltaTime:0.01666
uniform float deltaTime;
varying vec2 vUV;

vec2 velocityField(vec2 position) {
    
    float distance = length(position); 
    float angle = atan(position.y, position.x);  

    float speed = 0.1 * distance; 
    float vx = -speed * sin(angle);  
    float vy = speed * cos(angle);   
    
    return vec2(vx, vy); 
}

vec2 rotateAroundCenter(vec2 position, float time) {
    
    float angle = time * 2.0 * 3.14159265359 * 0.3;  // 2π * time 
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);

    // center is (0, 0)
    vec2 offset = position;

    // rotation matrix
    vec2 newPosition;
    newPosition.x = cosAngle * offset.x - sinAngle * offset.y;
    newPosition.y = sinAngle * offset.x + cosAngle * offset.y;

    return newPosition;
}

void main() {

    vec4 position = texture2D(posSampler, vUV);
    vec4 velocity = texture2D(velSampler, vUV);



    vec2 newPos = rotateAroundCenter(vec2(position.x, position.y), deltaTime);



    gl_FragData[0] = vec4(newPos,0,1);
    gl_FragData[1] = vec4(newPos,0,1); 
    gl_FragData[2] = vec4(deltaTime*100.0, 0, 0, 1);
    gl_FragData[3] = vec4(0, 0.7, 0,1);

}