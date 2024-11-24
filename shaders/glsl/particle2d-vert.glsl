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
attribute vec4 spinStartSpinSpeed;   // spinStart.x, spinSpeed.y
attribute vec4 colorMult;            // multiplies color and ramp textures


attribute uint index; //1024

//https://stackoverflow.com/questions/18453302/how-do-you-pack-one-32-bit-integers-into-4-8bit-ints-in-glsl-webgl/18454838#18454838

// Outgoing variables to fragment shader
varying vec2 outputTexcoord;
varying float outputPercentLife;
varying vec4 outputColorMult;

void main() {
  vec2 uv = uvLifeTimeFrameStart.xy;
  float lifeTime = uvLifeTimeFrameStart.z;
  float frameStart = uvLifeTimeFrameStart.w;

  // vec3 position = positionStartTime.xyz;
  vec4 posData = texture2D(posSampler, uv);
  vec3 position = posData.xyz;

  float startTime = positionStartTime.w;
  vec3 velocity = velocityStartSize.xyz;
  float startSize = velocityStartSize.w;
  vec3 acceleration = accelerationEndSize.xyz;
  float endSize = accelerationEndSize.w;
  float spinStart = spinStartSpinSpeed.x;
  float spinSpeed = spinStartSpinSpeed.y;

  float localTime = mod((time - startTime), timeRange);
  float percentLife = localTime / lifeTime;
  float frame = mod(floor(localTime / frameDuration + frameStart),
                    numFrames);
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