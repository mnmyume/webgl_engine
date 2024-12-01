var basicVert = "attribute vec3 gridIndex;\r\nattribute vec2 uv;\r\n\r\nuniform mat4 uPMatrix;\r\nuniform mat4 uVMatrix;\r\nuniform mat4 uMMatrix;\r\n\r\nvarying vec2 vTexCoord;\r\n\r\nvoid main(void) {\r\n\r\n    vec3 origin = gridIndex;\r\n    vec3 offset = vec3(uv.x, uv.y, 0);\r\n    vec3 position = origin + offset;\r\n\r\n    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);\r\n    vTexCoord = uv;\r\n}\r\n";

var basicFrag = "precision mediump float;\r\nvarying vec2 vTexCoord;\r\nuniform sampler2D uTexture;\r\n\r\nvoid main(void) {\r\n    // gl_FragColor = texture2D(uTexture, vTexCoord);\r\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n}\r\n";

var particle3dVert = "uniform float timeRange;\r\nuniform float time;\r\nuniform float frameDuration;\r\nuniform float numFrames;\r\nuniform mat4 uPMatrix;\r\nuniform mat4 uVMatrix;\r\nuniform mat4 uMMatrix;\r\n\r\n// Incoming vertex attributes\r\nattribute vec4 uvLifeTimeFrameStart; // uv, lifeTime, frameStart\r\nattribute vec4 positionStartTime;    // position.xyz, startTime\r\nattribute vec4 velocityStartSize;    // velocity.xyz, startSize\r\nattribute vec4 accelerationEndSize;  // acceleration.xyz, endSize\r\nattribute vec4 spinStartSpinSpeed;   // spinStart.x, spinSpeed.y\r\nattribute vec4 orientation;          // orientation quaternion\r\nattribute vec4 colorMult;            // multiplies color and ramp textures\r\n\r\n// Outgoing variables to fragment shader\r\nvarying vec2 outputTexcoord;\r\nvarying float outputPercentLife;\r\nvarying vec4 outputColorMult;\r\n\r\nvoid main(void) {\r\n    vec2 uv = uvLifeTimeFrameStart.xy;\r\n    float lifeTime = uvLifeTimeFrameStart.z;\r\n    float frameStart = uvLifeTimeFrameStart.w;\r\n    vec3 position = positionStartTime.xyz;\r\n    float startTime = positionStartTime.w;\r\n    vec3 velocity = velocityStartSize.xyz;\r\n    float startSize = velocityStartSize.w;\r\n    vec3 acceleration = accelerationEndSize.xyz;\r\n    float endSize = accelerationEndSize.w;\r\n    float spinStart = spinStartSpinSpeed.x;\r\n    float spinSpeed = spinStartSpinSpeed.y;\r\n    \r\n    float localTime = mod((time - startTime), timeRange);\r\n    float percentLife = localTime / lifeTime;\r\n    float frame = mod(floor(localTime / frameDuration + frameStart),\r\n                numFrames);\r\n    float uOffset = frame / numFrames;\r\n    float u = uOffset + (uv.x + 0.5) * (1. / numFrames);\r\n\r\n    outputTexcoord = vec2(u, uv.y + 0.5);\r\n    outputColorMult = colorMult;\r\n    \r\n    float size = mix(startSize, endSize, percentLife);\r\n    size = (percentLife < 0. || percentLife > 1.) ? 0. : size;\r\n    float s = sin(spinStart + spinSpeed * localTime);\r\n    float c = cos(spinStart + spinSpeed * localTime);\r\n    vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, 0., \r\n                             (uv.x * s - uv.y * c) * size, 1.);\r\n    vec3 center = velocity * localTime +\r\n                  acceleration * localTime * localTime + \r\n                  position;\r\n    vec4 q2 = orientation + orientation;\r\n    vec4 qx = orientation.xxxw * q2.xyzx;\r\n    vec4 qy = orientation.xyyw * q2.xyzy;\r\n    vec4 qz = orientation.xxzw * q2.xxzz;\r\n    mat4 localMatrix = mat4(\r\n        (1.0 - qy.y) - qz.z, \r\n        qx.y + qz.w, \r\n        qx.z - qy.w,\r\n        0,\r\n        qx.y - qz.w, \r\n        (1.0 - qx.x) - qz.z, \r\n        qy.z + qx.w,\r\n        0,\r\n        qx.z + qy.w, \r\n        qy.z - qx.w, \r\n        (1.0 - qx.x) - qy.y,\r\n        0,\r\n        center.x, center.y, center.z, 1);\r\n\r\n    rotatedPoint = localMatrix * rotatedPoint;\r\n\r\n    outputPercentLife = percentLife;\r\n\r\n    gl_Position = uPMatrix * uVMatrix * uMMatrix * rotatedPoint;\r\n}";

var particle2dVert = "uniform float timeRange;\r\nuniform float frameDuration;\r\nuniform float numFrames;\r\nuniform float time;\r\nuniform float tileSize;\r\nuniform float texWidth;\r\nuniform float texHeight;\r\nuniform mat4 uPMatrix;\r\nuniform mat4 uVMatrix;\r\nuniform mat4 uVInverseMatrix;\r\nuniform mat4 uMMatrix;\r\nuniform sampler2D posSampler;\r\n\r\n// Incoming vertex attributes\r\nattribute vec4 uvLifeTimeFrameStart; // uv, lifeTime, frameStart\r\nattribute vec4 positionStartTime;    // position.xyz, startTime\r\nattribute vec4 velocityStartSize;    // velocity.xyz, startSize\r\nattribute vec4 accelerationEndSize;  // acceleration.xyz, endSize\r\nattribute vec4 spinStartSpeedIndex;   // spinStart.x, spinSpeed.y, particleID.z, numParticles.w\r\nattribute vec4 colorMult;            // multiplies color and ramp textures\r\n\r\n// Outgoing variables to fragment shader\r\nvarying vec2 outputTexcoord;\r\nvarying float outputPercentLife;\r\nvarying vec4 outputColorMult;\r\n\r\nvoid main() {\r\n  vec2 uv = uvLifeTimeFrameStart.xy;\r\n  float lifeTime = uvLifeTimeFrameStart.z;\r\n  float frameStart = uvLifeTimeFrameStart.w;\r\n  // vec3 position = positionStartTime.xyz;\r\n  float startTime = positionStartTime.w;\r\n  vec3 velocity = velocityStartSize.xyz;\r\n  float startSize = velocityStartSize.w;\r\n  vec3 acceleration = accelerationEndSize.xyz;\r\n  float endSize = accelerationEndSize.w;\r\n  float spinStart = spinStartSpeedIndex.x;\r\n  float spinSpeed = spinStartSpeedIndex.y;\r\n  float particleID = spinStartSpeedIndex.z;\r\n  float numParticles = spinStartSpeedIndex.w; \r\n\r\n  float localTime = mod((time - startTime), timeRange);\r\n  float percentLife = localTime / lifeTime;\r\n  float frame = mod(floor(localTime / frameDuration + frameStart),\r\n                    numFrames);\r\n\r\n  int generation = int((time - startTime) / timeRange);\r\n\r\n  float posTexCoordU = (particleID * 4.0) / (numParticles * 4.0);  \r\n  float posTexCoordV = 1.0 - mod(float(generation), numParticles) / numParticles;\r\n  vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);\r\n  vec3 position = texture2D(posSampler, posTexCoord).xyz;\r\n\r\n  // float uOffset = frame / numFrames;\r\n  // float u = uOffset + (uv.x + 0.5) * (1. / numFrames);\r\n// \r\n  // outputTexcoord = vec2(u, uv.y + 0.5);\r\n\r\n  // test texcoord 6x6\r\n  float numCols = texWidth / tileSize;\r\n  float numRows = texHeight / tileSize;\r\n  int row = int(frame / numCols);\r\n  int col = int(mod(frame, numCols));\r\n  float uOffset = float(col) / float(numCols);\r\n  float vOffset = float(row) / float(numRows);\r\n  outputTexcoord = vec2(\r\n      uOffset + (uv.x + 0.5) / numCols, \r\n      1.0 - vOffset - (uv.y + 0.5) / numRows  \r\n  );\r\n\r\n  outputColorMult = colorMult;\r\n\r\n  vec3 basisX = uVInverseMatrix[0].xyz;\r\n  vec3 basisZ = uVInverseMatrix[1].xyz;\r\n  float size = mix(startSize, endSize, percentLife);\r\n  size = (percentLife < 0. || percentLife > 1.) ? 0. : size;\r\n  float s = sin(spinStart + spinSpeed * localTime);\r\n  float c = cos(spinStart + spinSpeed * localTime);\r\n  vec2 rotatedPoint = vec2(uv.x * c + uv.y * s, \r\n                           -uv.x * s + uv.y * c);\r\n  vec3 localPosition = vec3(basisX * rotatedPoint.x +\r\n                            basisZ * rotatedPoint.y) * size +\r\n                       velocity * localTime +\r\n                       acceleration * localTime * localTime + \r\n                       position;\r\n                       \r\n  outputPercentLife = percentLife;\r\n\r\n  gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(localPosition, 1.);\r\n}";

var particleFrag = "precision highp float;\r\n\r\nuniform sampler2D rampSampler;\r\nuniform sampler2D colorSampler;\r\n\r\n// Incoming variables from vertex shader\r\nvarying vec2 outputTexcoord;\r\nvarying float outputPercentLife;\r\nvarying vec4 outputColorMult;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 colorMult = texture2D(rampSampler, vec2(outputPercentLife, 0.5)) * outputColorMult;\r\n    gl_FragColor = texture2D(colorSampler, outputTexcoord); // * colorMult;\r\n    // gl_FragColor = vec4(outputTexcoord, 0.0, 1.0);\r\n}";

export { basicFrag, basicVert, particle2dVert, particle3dVert, particleFrag };
