precision highp float;

uniform vec2 canvas;

void main(void) {

    vec2 uv = gl_FragCoord.xy;

    float gradient = (1.0 - uv.y / canvas.x)*0.4;    // iResolution.x

    vec3 color = gradient * vec3(0.4,0.8,1.0);

    gl_FragColor = vec4(color, 1.0);
}
