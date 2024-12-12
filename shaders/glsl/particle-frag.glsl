precision highp float;

uniform sampler2D rampSampler;
uniform sampler2D colorSampler;

// Incoming variables from vertex shader
varying float outputPercentLife;
varying vec4 outputColorMult;
varying vec2 _ANI_TEX_UV;

void main(void) {

    vec4 colorMult = texture2D(rampSampler, vec2(outputPercentLife, 0.5)) * outputColorMult;
    gl_FragColor = texture2D(colorSampler, _ANI_TEX_UV);    // * colorMult;
    gl_FragColor = colorMult;
}