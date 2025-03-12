precision highp float;

#value color:vec3(0,1,0)
uniform vec3 color;


void main(void) {

    vec2 uv = gl_FragCoord.xy;  

    gl_FragColor = vec4(color,1);
}
