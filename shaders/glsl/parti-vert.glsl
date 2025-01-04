uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMMatrix;

attribute vec2 quad;
attribute vec2 aUV;

#value posSampler:0
uniform sampler2D posSampler;

void main(void) {
    vec2 uv = vec2(0.5, 0.5);
    vec3 position = texture2D(posSampler, uv).rgb;

    float size = 10.0;

    gl_PointSize = size; 
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);
}
