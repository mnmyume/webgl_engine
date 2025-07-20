uniform vec4 _ANI_TEX_0;  // texWidth.x, texHeight.y, tileSize.z, numFrames.w
uniform vec4 _ANI_TEX_1; // numTypes.x, aniSpeed.y

ivec2 _GEN_ANI_TEX_UV(sampler2D aniSampler, float tileSize, float frame){

    int texWidth = textureSize(aniSampler, 0).x;
    int texHeight = textureSize(aniSampler, 0).y;

    int numCols = texWidth / int(tileSize);
    int numRows = texHeight / int(tileSize);
    int row = int(frame) / numCols;
    int col = int(frame) % numCols;

    return ivec2(col, row);
}
