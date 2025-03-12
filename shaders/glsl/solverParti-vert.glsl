// uniform
uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;

#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

uniform float geneCount;
uniform float partiCount;

#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;
#value propertySampler:2
uniform sampler2D propertySampler;  // particleID.x, startTime.y, percentLife.z, generation.w

// attribute
#buffer particleID:partiBuffer size:1 stride:4 offset:0
attribute float particleID;

varying float outputPercentLife;

const float NUM_COMPONENTS = 1.0;
float pidPixels(float pid){
  return  pid*NUM_COMPONENTS;
}
float pidPixelsOffset(float pid, float offset){
  return  pid*NUM_COMPONENTS + offset + 0.5;
}

void main(void) {

  // read property from texture
  float propOffset = 0.0;
  float propTexCoordU = pidPixelsOffset(particleID, propOffset) / pidPixels(partiCount);
  float propTexCoordV = 0.5;
  vec2 propTexCoord = vec2(propTexCoordU, propTexCoordV);

  float startTime = texture2D(propertySampler, propTexCoord).y;
  float percentLife = texture2D(propertySampler, propTexCoord).z;
  float generation = texture2D(propertySampler, propTexCoord).w;

  // read position from texture
  float componentOffset = 0.0;
  float posTexCoordU = pidPixelsOffset(particleID, componentOffset) / pidPixels(partiCount);
  float posTexCoordV = 1.0 - (generation / geneCount + 0.5 / geneCount);  
  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);

  vec3 position = texture2D(posSampler, posTexCoord).xyz;

  float size = texture2D(posSampler, posTexCoord).w;
  size = (percentLife < 0. || percentLife > 1.) ? 0. : size;
  
  outputPercentLife = percentLife;

  gl_PointSize = 40.0;//size;
  gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(0.0,0.0,0.0, 1.0);
}
