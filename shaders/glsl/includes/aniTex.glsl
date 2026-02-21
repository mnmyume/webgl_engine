uniform ivec2 _uAniTexBoundarySize;
uniform ivec2 _uAniTexCellSize;
uniform float _uAniTexNumFrames;
uniform float _uAniTexFps;
uniform float _uAniTexCellRatio;

vec2 _GEN_ANI_TEX_UV(vec2 uv, sampler2D aniSampler, float aniType, float frameLife){

    float frame = mod(floor(frameLife*_uAniTexFps) , _uAniTexNumFrames);

    vec2 localUV = vec2(uv.x, uv.y);
    localUV.x = (localUV.x - 0.5) * _uAniTexCellRatio + 0.5;
//    if (localUV.x < 0.0 || localUV.x > 1.0 || localUV.y < 0.0 || localUV.y > 1.0) {
//        discard;
//    }

    int texWidth = textureSize(aniSampler, 0).x;
    int texHeight = textureSize(aniSampler, 0).y;
    int cellWidth = _uAniTexCellSize.x;
    int cellHeight = _uAniTexCellSize.y;

    float currFrame = aniType * _uAniTexNumFrames + frame;

    float numCols = float(texWidth / cellWidth);
    float numRows = float(texHeight / cellHeight);
    vec2 numColsRows = vec2(numCols, numRows);
    float row = floor(currFrame / numCols);
    float col = mod(currFrame, numCols);
    float uOffset = col/numCols;
    float vOffset = row/numRows;
    vec2 aniTexCoord = vec2(uOffset, vOffset);

    vec2 finalUV = localUV/numColsRows + aniTexCoord;

    return finalUV;
}
