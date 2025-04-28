precision highp float;

#value uColor:vec3(0,1,0)
uniform vec3 uColor;

varying vec2 vUV;
#value uTex:0
uniform sampler2D uTex;

void main(void) {

   gl_FragColor =   // vec4(uColor, 1.0);
        vec4(texture2D(uTex,vUV).rgb, 1.0);
}
