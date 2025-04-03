precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

varying float outputSize;
varying vec3 outputCol;
varying float debug;

void main() {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);
    float dist = length(p);

    if(outputSize>1.0 && dist < 1.0) {
        float innerRadius = 0.4;
        float alpha = dist < innerRadius ? 1.0 : smoothstep(1.0, innerRadius, dist);
         gl_FragColor = vec4(outputCol, alpha);
    } else {
        discard;
    }
}
