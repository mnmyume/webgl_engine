precision highp float;

#value rampSampler:0
uniform sampler2D rampSampler;

#value colorSampler:1
uniform sampler2D colorSampler;

// Incoming variables from vertex shader
varying float outputPercentLife;
varying vec4 _ANI_TEX_UV;   // ux.xy, numCols.z, numRows.w

void main(void) {
    vec2 pointUV = vec2(_ANI_TEX_UV.x, _ANI_TEX_UV.y);
    float numCols = _ANI_TEX_UV.z;
    float numRows = _ANI_TEX_UV.w;
    vec2 pointCoord = pointUV + vec2(gl_PointCoord.x / numCols, gl_PointCoord.y / numRows);
    vec4 colorMult = texture2D(rampSampler, vec2(outputPercentLife, 0.5));
    gl_FragColor = texture2D(colorSampler, pointCoord);    // * colorMult;
    // gl_FragColor = colorMult;
}