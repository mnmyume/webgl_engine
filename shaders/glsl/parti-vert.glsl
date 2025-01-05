uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;

attribute vec2 aUV;

#value posSampler:0
uniform sampler2D posSampler;

void main(void) {

    vec3 position = texture2D(posSampler, aUV).rgb;

    float size = 1.0;   //TODO: uniform

    gl_PointSize = size; 
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);
}
