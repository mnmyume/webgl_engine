uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;
uniform vec2 worldSize;

attribute vec2 aUV;

#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;

varying vec2 velocity;

void main(void) {

    vec2 position = texture2D(posSampler, aUV).rg;
    velocity = texture2D(velSampler, aUV).rg;

    float size = 2.0;   

    gl_PointSize = size; 
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 0.0, 1.0);
}
