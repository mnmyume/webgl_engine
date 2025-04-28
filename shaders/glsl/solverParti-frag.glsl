precision mediump float;

#value uColorSampler:1
uniform sampler2D uColorSampler;

#value uBlurRadius:0.1
uniform float uBlurRadius;

#value uRadius:0.8
uniform float uRadius;

#value uPixelNum:8
uniform float uPixelNum;

varying float vSize;
varying vec3 vColor;
varying float vDebug;

void main() {
    // vec2 p = 2.0 * (gl_PointCoord - 0.5);
    float pixelNum = uPixelNum / 2.0;
    vec2 p = floor((2.0 * (gl_PointCoord - 0.5))*pixelNum)/pixelNum;
    float dist = length(p);

    if(vSize>1.0 && dist < uRadius) {
        float alpha = dist < uBlurRadius ? 1.0 : smoothstep(1.0, uBlurRadius, dist);
        gl_FragColor = vec4(vColor, alpha);
    } else {
        discard;
    }
}
