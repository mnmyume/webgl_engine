precision highp float;

#value color:vec3(0,1,0)
uniform vec3 color;

varying vec2 vUV;
#value tex:0
uniform sampler2D tex;

void main(void) {


    gl_FragColor = vec4(color,1.0);
//        vec4(texture2D(tex,vUV).rgb,1.0);
}
