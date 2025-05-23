#include "./testFolder/aniTex.glsl"
#extension GL_OES_texture_float : enable
//https://registry.khronos.org/OpenGL/extensions/OES/OES_texture_float.txt
#extension GL_OES_texture_float_linear : enable

// uniform
uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
uniform mat4 _uni_modelMat;
uniform float uDuration;
uniform float uTime;
uniform float uPartiCount;
uniform float uNumGen;
uniform vec3 uGravity;
uniform float uLifeTime;


// PixelOne(pos.xyz, startSize.w) PixelTwo(linearVel.xyz, endSize.w)
#value uGeneratorSampler:2
uniform sampler2D uGeneratorSampler;


#define ANI_TEX
/* MACRO */
#ifdef ANI_TEX
#endif  /* MACRO ANI_TEX*/

// attribute
attribute float aStartTime;
attribute float aParticleID;

varying float vPercentLife;

const float NUM_COMPONENTS = 2.0;
float pidPixels(float pid){
  return  pid*NUM_COMPONENTS;
}
float pidPixelsOffset(float pid, float offset){
  return  pid*NUM_COMPONENTS + offset + 0.5;
}

void main() {
  
  // aniTex
  float texWidth = _ANI_TEX_0.x;
  float texHeight = _ANI_TEX_0.y;
  float tileSize = _ANI_TEX_0.z;
  float numFrames = _ANI_TEX_0.w;
  float frameDuration = 1.0 / _ANI_TEX_0_FPS;

  float localTime = mod(uTime - aStartTime, uLifeTime) ;
  float percentLife = localTime / uLifeTime;
  float frame = mod(floor(localTime / frameDuration), numFrames);
  float generation = floor((uTime - aStartTime) / uDuration);

  float componentOffset = 0.0;
  float posTexCoordU = pidPixelsOffset(aParticleID, componentOffset) / pidPixels(uPartiCount);
  float posTexCoordV = 1.0 - (generation / uNumGen + 0.5 / uNumGen);  
  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);
  vec3 position = texture2D(uGeneratorSampler, posTexCoord).xyz;
  float startSize = texture2D(uGeneratorSampler, posTexCoord).w;

  componentOffset = 1.0;
  float linearVelTexCoordU =  pidPixelsOffset(aParticleID, componentOffset) / pidPixels(uPartiCount);
  float linearVelTexCoordV = 1.0 - (generation / uNumGen + 0.5 / uNumGen);  
  vec2 linearVelTexCoord = vec2(linearVelTexCoordU, linearVelTexCoordV);
  vec3 linearVelocity = texture2D(uGeneratorSampler, linearVelTexCoord).xyz;
  float endSize = texture2D(uGeneratorSampler, linearVelTexCoord).w;

  _GEN_ANI_TEX_UV(texWidth, texHeight, tileSize, frame);

  float size = mix(startSize, endSize, percentLife);
  size = (percentLife < 0. || percentLife > 1.) ? 0. : size;

  vec3 velocity = linearVelocity;
  vec3 localPosition = velocity * localTime +
                       // acceleration * localTime * localTime + 
                       position; 
                       
  vPercentLife = percentLife;
  gl_PointSize = size; 
  gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(localPosition, 1.);
}
