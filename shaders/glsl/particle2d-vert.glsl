#include "./testFolder/aniTex.glsl"

uniform float duration;
uniform float time;
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uVInverseMatrix;
uniform mat4 uMMatrix;
uniform sampler2D posSampler;

#define ANI_TEX
/* MACRO */
#ifdef ANI_TEX
#endif  /* MACRO ANI_TEX*/

// Incoming vertex attributes
attribute vec4 uvLifeTimeFrameStart; // uv, lifeTime, frameStart
attribute vec4 numParticleGen;       // numParticle.x, numGen.y
attribute vec4 velocityStartSize;    // velocity.xyz, startSize
attribute vec4 accelerationEndSize;  // acceleration.xyz, endSize
attribute vec4 spinStartSpeedIndex;   // spinStart.x, spinSpeed.y, particleID.z
attribute vec4 colorMult;            // multiplies color and ramp textures

// Outgoing variables to fragment shader
varying float outputPercentLife;
varying vec4 outputColorMult;

void main() {
  vec2 uv = uvLifeTimeFrameStart.xy;
  float lifeTime = uvLifeTimeFrameStart.z;
  float frameStart = uvLifeTimeFrameStart.w;
  float numParticle = numParticleGen.x;
  float numGen = numParticleGen.y;
  vec3 velocity = velocityStartSize.xyz;
  float startSize = velocityStartSize.w;
  vec3 acceleration = accelerationEndSize.xyz;
  float endSize = accelerationEndSize.w;
  float spinStart = spinStartSpeedIndex.x;
  float spinSpeed = spinStartSpeedIndex.y;
  float particleID = spinStartSpeedIndex.z;
  
  // aniTex
  float texWidth = _ANI_TEX_0.x;
  float texHeight = _ANI_TEX_0.y;
  float tileSize = _ANI_TEX_0.z;
  float numFrames = _ANI_TEX_0.w;
  float frameDuration = 1.0 / _ANI_TEX_0_FPS;

  // TODO: startTime
  float localTime = mod(time, duration); //  - startTime
  float percentLife = localTime / lifeTime;
  float frame = mod(floor(localTime / frameDuration + frameStart),
                    numFrames);
  float generation = floor((time) / duration);  //  - startTime

  float posTexCoordU = particleID  / numParticle + 0.5/numParticle;
  float posTexCoordV = 1.0 - (generation/numGen+0.5/numGen); //mod(generation, numParticle) / numGen;
  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);
  vec3 position = texture2D(posSampler, posTexCoord).xyz;

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
  vec3 localPosition = vec3(basisX * rotatedPoint.x +
                            basisZ * rotatedPoint.y) * size +
                       velocity * localTime +
                       acceleration * localTime * localTime + 
                       position;
                       
  outputPercentLife = percentLife;

  gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(localPosition, 1.);
}