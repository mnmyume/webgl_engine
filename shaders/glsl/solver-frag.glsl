precision highp float;
#extension GL_EXT_draw_buffers : require
#value position:0
uniform sampler2D position;
#value velociy:1
uniform sampler2D velociy;

#value deltaTime:0.01666
uniform float deltaTime;
varying vec2 vUV;

void main() {

    // vec4 psample = texture2D(position, vUV);
    // vec4 vsample = texture2D(velocity, vUV);


    //STEP one
    gl_FragData[0] = vec4(0.25,0,0,1);
    gl_FragData[1] = vec4(0,0.5,0,1);
    gl_FragData[2] = vec4(0,0,0.75,1);
    gl_FragData[3] = vec4(1.0,0,0,1);


}