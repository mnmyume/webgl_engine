uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
uniform mat4 _uni_modelMat;
uniform float uSize;

attribute vec2 aUV;

#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;

varying vec2 velocity;

void main(void) {

    vec2 position = texture2D(posSampler, aUV).rg;
    velocity = texture2D(velSampler, aUV).rg;

    gl_PointSize = uSize; 
    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 0.0, 1.0);
}
