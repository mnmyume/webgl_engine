uniform float timeRange;
uniform float frameDuration;
uniform float numFrames;
uniform float time;
uniform float tileSize;
uniform float texWidth;
uniform float texHeight;
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
attribute vec4 spinStartSpeedIndex;   // spinStart.x, spinSpeed.y, particleID.z, numParticles.w
attribute vec4 colorMult;            // multiplies color and ramp textures

// Outgoing variables to fragment shader
varying vec2 outputTexcoord;
varying float outputPercentLife;
varying vec4 outputColorMult;

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
  float numParticles = spinStartSpeedIndex.w; 

  float localTime = mod((time - startTime), timeRange);
  float percentLife = localTime / lifeTime;
  float frame = mod(floor(localTime / frameDuration + frameStart),
                    numFrames);

  int generation = int((time - startTime) / timeRange);

  float posTexCoordU = (particleID * 4.0) / (numParticles * 4.0);  
  float posTexCoordV = 1.0 - mod(float(generation), numParticles) / numParticles;
  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);
  vec3 position = texture2D(posSampler, posTexCoord).xyz;

  // float uOffset = frame / numFrames;
  // float u = uOffset + (uv.x + 0.5) * (1. / numFrames);
// 
  // outputTexcoord = vec2(u, uv.y + 0.5);

  // test texcoord 6x6
  float numCols = texWidth / tileSize;
  float numRows = texHeight / tileSize;
  int row = int(frame / numCols);
  int col = int(mod(frame, numCols));
  float uOffset = float(col) / float(numCols);
  float vOffset = float(row) / float(numRows);
  outputTexcoord = vec2(
      uOffset + (uv.x + 0.5) / numCols, 
      1.0 - vOffset - (uv.y + 0.5) / numRows  
  );

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