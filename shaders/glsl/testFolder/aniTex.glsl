uniform vec4 _ANI_TEX_0;  // texWidth.x, texHeight.y, tileSize.z, numFrames.w
uniform float _ANI_TEX_0_FPS;    // frameDuration = numFrames / _ANI_TEX_0_FPS;
varying vec4 _ANI_TEX_UV; // ux.xy, numCols.z, numRows.w

void _GEN_ANI_TEX_UV(float texWidth, float texHeight, float tileSize, float frame){
  float numCols = texWidth / tileSize;
  float numRows = texHeight / tileSize;
  float row = floor(frame / numCols);
  float col = mod(frame, numCols);
  float uOffset = col / numCols;
  float vOffset = row / numRows;

  _ANI_TEX_UV = vec4(
      uOffset, // + (uv.x + 0.5) / numCols
      vOffset, //  - (uv.y + 0.5) / numRows
      numCols, 
      numRows
  );
}