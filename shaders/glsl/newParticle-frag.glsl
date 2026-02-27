#version 300 es
precision highp float;
precision highp int;

#define TEXEL_SHINK vec2(1,1)

#value uAniTex:2
uniform sampler2D uAniTex;

#value shrink:0.88
uniform float shrink;
#value uAlpha:1.0
uniform float uAlpha;
#value uTexCellSize:160
uniform float uTexCellSize;
#value uTexSize:[1920, 1440]
uniform vec2 uTexSize;

in vec2 vUV;
in vec4 vTexBoundary;

out vec4 fragColor;


vec4 rdTexUV(sampler2D tex,float cellSize, vec2 texRes){
    //vec2 tileCount = texRes/cellSize;
    vec2 tileSize = cellSize/texRes; //= 1.0/tileCount
    vec2 texelSize = 1.0/texRes;
    vec2 localUV = vUV*(1.0-2.0 * TEXEL_SHINK*texelSize) + TEXEL_SHINK*texelSize;
    vec2 boundaryIndex = vTexBoundary.xy, texBoundarySize = vTexBoundary.zw;
    vec2 uv = boundaryIndex * tileSize + texBoundarySize*localUV*tileSize;
    uv = fract(uv);
    return  texture(tex, uv);
}

void main()
{
    vec4 color;

    color = rdTexUV(uAniTex, uTexCellSize, uTexSize);

    if(color.a>0.5)
        fragColor = vec4(color.rgb, uAlpha);
    else
        discard;
}