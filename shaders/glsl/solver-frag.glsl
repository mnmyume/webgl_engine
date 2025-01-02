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

void main() {

    vec4 position = texture2D(posSampler, vUV);
    vec4 velocity = texture2D(velSampler, vUV);


    // STEP one
    position = position + vec4(0.0,0.002,0.0,0.0);
    position.y = mod(position.y, 1.0);
    gl_FragData[0] = position;
    gl_FragData[1] = vec4(0,0.5,0,1);
    gl_FragData[2] = vec4(0,0,0.75,1);
    gl_FragData[3] = vec4(0.0,0,0,1);


    // STEP two
    // gl_FragData[0] = vec4(psample+0.5);
    // n =  psample+0.5;
    // if(mod(n, 0.5) < 0.0001)
    //     gl_FragData[1] = vec4(1.0, 0.0,0.0,1.0 );
    // else
    //     gl_FragData[1] = vec4(1.0, 1.0,0.0,1.0 );
    // position = position + vec4(0.0,0.02,0.0,0.0);
    // position = mod(position, 1.0); 
    // gl_FragData[0] = position;
    // gl_FragData[1] = vec4(0,0.5,0,1);
    // gl_FragData[2] = vec4(0,0,0.75,1);
    // gl_FragData[3] = vec4(0.0,0,0,1);
}