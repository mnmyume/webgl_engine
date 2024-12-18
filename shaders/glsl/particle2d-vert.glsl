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
uniform sampler2D posSampler; // pos.xyzw, linearVel.xyzw, angularVel.xyzw

#define ANI_TEX
/* MACRO */
#ifdef ANI_TEX
#endif  /* MACRO ANI_TEX*/

// attribute
attribute vec2 uv;
attribute float lifeTime;
attribute float frameStart;
attribute float startTime;
attribute float startSize;
attribute float endSize;
attribute float spinStart;
attribute float spinSpeed;
attribute float particleID;
attribute vec4 colorMult;

varying float outputPercentLife;
varying vec4 outputColorMult;

const float NUM_COMPONENTS = 3.0;
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

  float localTime = mod(time, duration) - startTime;
  float percentLife = localTime / lifeTime;
  float frame = mod(floor(localTime / frameDuration + frameStart),
                    numFrames);
  float generation = floor(time / duration) - startTime;


  float componentOffset = 0.0;
  float posTexCoordU = pidPixelsOffset(particleID, componentOffset) / pidPixels(numParticle);
  float posTexCoordV = 1.0 - (generation / numGen + 0.5 / numGen);  
  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);
  vec3 position = texture2D(posSampler, posTexCoord).xyz;


  componentOffset = 1.0;
  float linearVelTexCoordU =  pidPixelsOffset(particleID, componentOffset) / pidPixels(numParticle);
  float linearVelTexCoordV = 1.0 - (generation / numGen + 0.5 / numGen);  
  vec2 linearVelTexCoord = vec2(linearVelTexCoordU, linearVelTexCoordV);
  vec3 linearVelocity = texture2D(posSampler, linearVelTexCoord).xyz;

  componentOffset = 2.0;
  float angularVelTexCoordU = pidPixelsOffset(particleID, componentOffset)  / pidPixels(numParticle);
  float angularVelTexCoordV = 1.0 - (generation / numGen + 0.5 / numGen);  
  vec2 angularVelTexCoord = vec2(angularVelTexCoordU, angularVelTexCoordV);
  vec3 angularVelocity = texture2D(posSampler, angularVelTexCoord).xyz;

  _GEN_ANI_TEX_UV(texWidth, texHeight, tileSize, frame, uv);

  outputColorMult = colorMult;

  vec3 basisX = uVInverseMatrix[0].xyz;
  vec3 basisZ = uVInverseMatrix[1].xyz;
  float size = mix(startSize, endSize, percentLife);
  size = (percentLife < 0. || percentLife > 1.) ? 0. : size;
  float s = sin(spinStart + spinSpeed * localTime);
  float c = cos(spinStart + spinSpeed * localTime);
  vec2 rotatedPoint = vec2(uv.x * c + uv.y * s, 
                           -uv.x * s + uv.y * c);
  vec3 velocity = linearVelocity;
  vec3 localPosition = vec3(basisX * rotatedPoint.x +
                            basisZ * rotatedPoint.y) * size +
                       velocity * localTime +
                       // acceleration * localTime * localTime + 
                       position;  // TEST: position, linearVelocity, angularVelocity
                       
  outputPercentLife = percentLife;

  gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(localPosition, 1.);
}
