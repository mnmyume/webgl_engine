uniform vec4 _ANI_TEX_0;  // texWidth.x, texHeight.y, tileSize.z, numFrames.w
uniform float _ANI_TEX_0_FPS;    // frameDuration = numFrames / _ANI_TEX_0_FPS;
varying vec2 _ANI_TEX_UV;

void _GEN_ANI_TEX_UV(float texWidth, float texHeight, float tileSize, float frame, vec2 uv){
  float numCols = texWidth / tileSize;
  float numRows = texHeight / tileSize;
  int row = int(frame / numCols);
  int col = int(mod(frame, numCols));
  float uOffset = float(col) / float(numCols);
  float vOffset = float(row) / float(numRows);

  _ANI_TEX_UV = vec2(
      uOffset + (uv.x + 0.5) / numCols, 
      1.0 - vOffset - (uv.y + 0.5) / numRows  
  );
}