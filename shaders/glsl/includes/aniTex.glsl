uniform vec4 _ANI_TEX_0;  // texWidth.x, texHeight.y, tileSize.z, numFrames.w
uniform vec4 _ANI_TEX_1; // numTypes.x, aniSpeed.y

vec4 _GEN_ANI_TEX_UV(sampler2D aniSampler, float tileSize, float frame){

    int texWidth = textureSize(aniSampler, 0).x;
    int texHeight = textureSize(aniSampler, 0).y;

    float numCols = float(texWidth) / tileSize;
    float numRows = float(texHeight) / tileSize;
    float row = floor(frame / numCols);
    float col = mod(frame, numCols);
    float uOffset = col/numCols;
    float vOffset = row/numRows;

    return vec4(uOffset, vOffset, numCols, numRows);
}
