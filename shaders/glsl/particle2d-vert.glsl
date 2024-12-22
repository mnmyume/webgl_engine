#include "./testFolder/aniTex.glsl"

// uniform
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uVInverseMatrix;
uniform mat4 uMMatrix;
uniform float duration;
uniform float time;
uniform float numParticle;
uniform float numGen;
uniform vec3 gravity;
uniform float lifeTime;
uniform sampler2D posSampler; // pos.xyz, startSize.w, linearVel.xyz, endSize.w

#define ANI_TEX
/* MACRO */
#ifdef ANI_TEX
#endif  /* MACRO ANI_TEX*/

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

void main() {
  
  // aniTex
  float texWidth = _ANI_TEX_0.x;
  float texHeight = _ANI_TEX_0.y;
  float tileSize = _ANI_TEX_0.z;
  float numFrames = _ANI_TEX_0.w;
  float frameDuration = 1.0 / _ANI_TEX_0_FPS;

  float localTime = mod(time - startTime, duration) ;
  float percentLife = localTime / lifeTime;
  float frame = mod(floor(localTime / frameDuration),
                    numFrames);
  float generation = floor((time - startTime) / duration);

  float componentOffset = 0.0;
  float posTexCoordU = pidPixelsOffset(particleID, componentOffset) / pidPixels(numParticle);
  float posTexCoordV = 1.0 - (generation / numGen + 0.5 / numGen);  
  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);
  vec3 position = texture2D(posSampler, posTexCoord).xyz;
  float startSize = texture2D(posSampler, posTexCoord).w;

  componentOffset = 1.0;
  float linearVelTexCoordU =  pidPixelsOffset(particleID, componentOffset) / pidPixels(numParticle);
  float linearVelTexCoordV = 1.0 - (generation / numGen + 0.5 / numGen);  
  vec2 linearVelTexCoord = vec2(linearVelTexCoordU, linearVelTexCoordV);
  vec3 linearVelocity = texture2D(posSampler, linearVelTexCoord).xyz;
  float endSize = texture2D(posSampler, linearVelTexCoord).w;

  _GEN_ANI_TEX_UV(texWidth, texHeight, tileSize, frame);

  float size = mix(startSize, endSize, percentLife);
  size = (percentLife < 0. || percentLife > 1.) ? 0. : size;

  vec3 velocity = linearVelocity;
  vec3 localPosition = velocity * localTime +
                       // acceleration * localTime * localTime + 
                       position; 
                       
  outputPercentLife = percentLife;
  gl_PointSize = size; 
  gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(localPosition, 1.);
}
