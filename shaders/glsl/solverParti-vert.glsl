// uniform
uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;

#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

uniform float geneCount;
uniform float partiCount;
uniform float MAXCOL;

#value posSampler:0
uniform sampler2D posSampler;

// attribute
#buffer particleID:partiBuffer size:1 stride:4 offset:0
attribute float particleID;

varying float outputSize;

const float NUM_COMPONENTS = 1.0;
float pidPixels(float pid){
  return  pid*NUM_COMPONENTS;
}
float pidPixelsOffset(float pid, float offset){
  return  pid*NUM_COMPONENTS + offset + 0.5;
}

vec2 getSolverCoord(float pid, float MAXCOL){
  return vec2(mod(pid,MAXCOL), floor(pid/MAXCOL));
}

void main() {

  // read position from texture
  vec2 posTexCoord = getSolverCoord(particleID, MAXCOL);

  vec3 position = texture2D(posSampler, posTexCoord).xyz;

  float size = texture2D(posSampler, posTexCoord).w;
  
  outputSize = size;

  gl_PointSize = size;
  gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position,1);
}
