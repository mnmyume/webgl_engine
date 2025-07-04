#version 300 es
precision highp float;
precision highp int;

uniform vec2 uCanvas;

out vec4 fragColor;

void main(void) {

    vec2 uv = gl_FragCoord.xy;

    float gradient = (1.0 - uv.y / uCanvas.x)*0.4;    // iResolution.x

    vec3 color = gradient * vec3(0.4,0.8,1.0);

    fragColor = vec4(color, 1.0);
}