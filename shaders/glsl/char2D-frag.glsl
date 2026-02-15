#version 300 es
precision mediump float;
precision mediump int;



in vec2 vUV;


#value uAniTex:7
uniform sampler2D uAniTex;


#value uTexCellSize:48
uniform float uTexCellSize;
#value uTexSize:[1408, 1088]
uniform vec2 uTexSize;

#define TEXEL_SHINK vec2(1,1)

in vec4 vTexBoundary;
#value uAlpha:1.0
uniform float uAlpha;

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



void main(void) {


    vec4 color;

    color = rdTexUV(uAniTex, uTexCellSize, uTexSize);

//    if(color.a>0.5)
//        fragColor = vec4(color.rgb, uAlpha);
//    else
//        discard;
    fragColor = vec4(1.0);
}
