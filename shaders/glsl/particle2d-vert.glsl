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
  float index = spinStartSpeedIndex.z;

  float localTime = mod((time - startTime), timeRange);
  float percentLife = localTime / lifeTime;
  float frame = mod(floor(localTime / frameDuration + frameStart),
                    numFrames);

  int generation = int((time - startTime) / timeRange);

  float posTexCoordXX = (index * 4.0) / 4096.0;
  float posTexCoordXY = (index * 4.0 + 1.0) / 4096.0;
  float posTexCoordXZ = (index * 4.0 + 2.0) / 4096.0;
  float posTexCoordY = mod(float(generation), 1024.0) / 1024.0; 
  float posX = DecodeFloatRGBA(posSampler, posTexCoordXX, posTexCoordY);
  float posY = DecodeFloatRGBA(posSampler, posTexCoordXY, posTexCoordY);
  float posZ = DecodeFloatRGBA(posSampler, posTexCoordXZ, posTexCoordY);
  vec3 position = vec3(posX, posY, posZ);

  float uOffset = frame / numFrames;
  float u = uOffset + (uv.x + 0.5) * (1. / numFrames);

  outputTexcoord = vec2(u, uv.y + 0.5);
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