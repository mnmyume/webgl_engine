uniform float timeRange;
uniform float time;
uniform float frameDuration;
uniform float numFrames;
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uVInverseMatrix;
uniform mat4 uMMatrix;
uniform sampler2D posSampler;

// Incoming vertex attributes
attribute vec4 uvLifeTimeFrameStart; // uv, lifeTime, frameStart
attribute vec4 positionStartTime;    // position.xyz, startTime
attribute vec4 velocityStartSize;    // velocity.xyz, startSize
attribute vec4 accelerationEndSize;  // acceleration.xyz, endSize
attribute vec4 spinStartSpeedIndex;   // spinStart.x, spinSpeed.y, index.z
attribute vec4 colorMult;            // multiplies color and ramp textures


//attribute uint index; //1024

//https://stackoverflow.com/questions/18453302/how-do-you-pack-one-32-bit-integers-into-4-8bit-ints-in-glsl-webgl/18454838#18454838

// Outgoing variables to fragment shader
varying vec2 outputTexcoord;
varying float outputPercentLife;
varying vec4 outputColorMult;

// https://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
float DecodeFloatRGBA(sampler2D tex, float texCoordX, float texCoordY) {
  vec2 texCoord = vec2(texCoordX, texCoordY);
  vec4 rgba = texture2D(tex, texCoord);
  return dot(rgba, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));
}

void main() {
  vec2 uv = uvLifeTimeFrameStart.xy;
  float lifeTime = uvLifeTimeFrameStart.z;
  float frameStart = uvLifeTimeFrameStart.w;
  // vec3 position = positionStartTime.xyz;
  float startTime = positionStartTime.w;
  vec3 velocity = velocityStartSize.xyz;
  float startSize = velocityStartSize.w;
  vec3 acceleration = accelerationEndSize.xyz;
  float endSize = accelerationEndSize.w;
  float spinStart = spinStartSpeedIndex.x;
  float spinSpeed = spinStartSpeedIndex.y;
  float particleID = spinStartSpeedIndex.z;

  float localTime = mod((time - startTime), timeRange);
  float percentLife = localTime / lifeTime;
  float frame = mod(floor(localTime / frameDuration + frameStart),
                    numFrames);

  int generation = int((time - startTime) / timeRange);

  float posTexCoordUX = (particleID * 2.0) / 1024.0;
  float posTexCoordUY = (particleID * 2.0 + 1.0) / 1024.0;
  float posTexCoordUZ = 0.0;
  float posTexCoordV = 1.0 - mod(float(generation), 1024.0) / 1024.0;


  vec3 position = texture2D(posSampler,vec2( posTexCoordUX,posTexCoordV)).xyz;

  float uOffset = frame / numFrames;
  float u = uOffset + (uv.x + 0.5) * (1. / numFrames);

  outputTexcoord = vec2(u, uv.y + 0.5);
  outputColorMult = vec4(1.0-particleID/255.0, 0.0,0.0,1.0);//colorMult;

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