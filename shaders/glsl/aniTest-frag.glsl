precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

uniform float blurRadius;
uniform float pixelNum;

varying float outputSize;
varying vec3 outputCol;
varying float debug;

varying vec4 _ANI_TEX_UV;   // ux.xy, numCols.z, numRows.w

void main() {
    // vec2 p = floor((2.0 * (gl_PointCoord - 0.5))*pixelNum)/pixelNum;
    vec2 aniTexCoord = _ANI_TEX_UV.xy;
    float texNumCols = _ANI_TEX_UV.z;
    float texNumRows = _ANI_TEX_UV.w;
    vec2 uv = aniTexCoord + vec2(gl_PointCoord.x / texNumCols, gl_PointCoord.y / texNumRows);
    gl_FragColor = texture2D(colorSampler, aniTexCoord);
}
