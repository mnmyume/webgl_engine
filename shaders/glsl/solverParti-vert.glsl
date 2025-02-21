// uniform
uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
uniform mat4 _uni_modelMat;

uniform float time;
uniform float duration;
uniform float partiCount;
uniform float geneCount;
uniform float lifeTime;

#value posSampler:0
uniform sampler2D posSampler;
#value velSampler:1
uniform sampler2D velSampler;

// attribute
attribute float startTime;
attribute float particleID;

varying float outputPercentLife;

const float NUM_COMPONENTS = 2.0;
float pidPixels(float pid){
  return  pid*NUM_COMPONENTS;
}
float pidPixelsOffset(float pid, float offset){
  return  pid*NUM_COMPONENTS + offset + 0.5;
}

void main(void) {

  // float localTime = mod(time - startTime, duration);
  float localTime = time - startTime;
  float percentLife = localTime / lifeTime;
  float generation = floor((time - startTime) / duration);

  float componentOffset = 0.0;
  float posTexCoordU = pidPixelsOffset(particleID, componentOffset) / pidPixels(partiCount);
  float posTexCoordV = 1.0 - (generation / geneCount + 0.5 / geneCount);  
  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);

  vec3 position = texture2D(posSampler, posTexCoord).rgb;

  float size = texture2D(posSampler, posTexCoord).a;
  size = (percentLife < 0. || percentLife > 1.) ? 0. : size;
  
  outputPercentLife = percentLife;

  gl_PointSize = size; 
  gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(position, 1.0);
}
