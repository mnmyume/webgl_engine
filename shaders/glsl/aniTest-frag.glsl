precision mediump float;

#value uColorSampler:4
uniform sampler2D uColorSampler;

uniform float uBlurRadius;
uniform float uPixelNum;

varying float vSize;
varying vec3 vColor;
varying float vDebug;

varying vec4 _ANI_TEX_UV;   // ux.xy, numCols.z, numRows.w

void main() {
    // vec2 p = floor((2.0 * (gl_PointCoord - 0.5))*uPixelNum)/uPixelNum;
    vec2 aniTexCoord = _ANI_TEX_UV.xy;
    float texColNum = _ANI_TEX_UV.z;
    float texRowNum = _ANI_TEX_UV.w;
    vec2 uv = aniTexCoord + vec2(gl_PointCoord.x / texColNum, gl_PointCoord.y / texRowNum);
    gl_FragColor = texture2D(uColorSampler, uv);
}
