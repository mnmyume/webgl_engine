var basicVert = {"code":"#line 1 1 \n  uniform vec4 _ANI_TEX_0;  // texWidth.x, texHeight.y, tileSize.z, numFrames.w\r \n#line 2 1 \n  uniform float _ANI_TEX_0_FPS;    // frameDuration = numFrames / _ANI_TEX_0_FPS;\r \n#line 3 1 \n  varying vec4 _ANI_TEX_UV; // ux.xy, numCols.z, numRows.w\r \n#line 4 1 \n  \r \n#line 5 1 \n  void _GEN_ANI_TEX_UV(float texWidth, float texHeight, float tileSize, float frame){\r \n#line 6 1 \n    float numCols = texWidth / tileSize;\r \n#line 7 1 \n    float numRows = texHeight / tileSize;\r \n#line 8 1 \n    float row = floor(frame / numCols);\r \n#line 9 1 \n    float col = mod(frame, numCols);\r \n#line 10 1 \n    float uOffset = col / numCols;\r \n#line 11 1 \n    float vOffset = row / numRows;\r \n#line 12 1 \n  \r \n#line 13 1 \n    _ANI_TEX_UV = vec4(\r \n#line 14 1 \n        uOffset, // + (uv.x + 0.5) / numCols\r \n#line 15 1 \n        1.0 - vOffset, //  - (uv.y + 0.5) / numRows  \r \n#line 16 1 \n        numCols, \r \n#line 17 1 \n        numRows\r \n#line 18 1 \n    );\r \n#line 19 1 \n  } \n\n#line 1 2 \n  \r \n#line 2 2 \n  \r \n#line 3 2 \n  attribute vec3 vertex;\r \n#line 4 2 \n  attribute vec2 uv;\r \n#line 5 2 \n  \r \n#line 6 2 \n  uniform mat4 uPMatrix;\r \n#line 7 2 \n  uniform mat4 uVMatrix;\r \n#line 8 2 \n  uniform mat4 uMMatrix;\r \n#line 9 2 \n  \r \n#line 10 2 \n  varying vec2 vUV;\r \n#line 11 2 \n  \r \n#line 12 2 \n  void main(void) {\r \n#line 13 2 \n  \r \n#line 14 2 \n      vec3 offset = vec3(uv.x, uv.y, 0);\r \n#line 15 2 \n      vec3 position = vertex + offset;\r \n#line 16 2 \n  \r \n#line 17 2 \n      gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);\r \n#line 18 2 \n      vUV = uv;\r \n#line 19 2 \n  }\r \n#line 20 2 \n   \n","extension":{},"attributes":{"vertex":{"type":"vec3","value":null},"uv":{"type":"vec2","value":null}},"uniforms":{"_ANI_TEX_0":{"type":"vec4","value":null},"_ANI_TEX_0_FPS":{"type":"float","value":null},"uPMatrix":{"type":"mat4","value":null},"uVMatrix":{"type":"mat4","value":null},"uMMatrix":{"type":"mat4","value":null}},"file":{"1":"./shaders/glsl/testFolder/aniTex.glsl","2":"./shaders/glsl/basic-vert.glsl"}};

var basicFrag = {"code":"\n#line 1 1 \n  precision mediump float;\r \n#line 2 1 \n  \r \n#line 3 1 \n  varying vec2 vUV;\r \n#line 4 1 \n  \r \n#line 5 1 \n  \r \n#line 6 1 \n  uniform sampler2D texture;\r \n#line 7 1 \n  \r \n#line 8 1 \n  void main(void) {\r \n#line 9 1 \n      gl_FragColor = texture2D(texture, vUV);\r \n#line 10 1 \n  }\r \n#line 11 1 \n   \n","extension":{},"attributes":{},"uniforms":{"texture":{"type":"sampler2D","value":"0"}},"file":{"1":"./shaders/glsl/basic-frag.glsl","2":"./shaders/glsl/basic-vert.glsl"}};

var particle3dVert = {"code":"\n#line 1 1 \n  uniform float duration;\r \n#line 2 1 \n  uniform float time;\r \n#line 3 1 \n  uniform float frameDuration;\r \n#line 4 1 \n  uniform float numFrames;\r \n#line 5 1 \n  uniform mat4 uPMatrix;\r \n#line 6 1 \n  uniform mat4 uVMatrix;\r \n#line 7 1 \n  uniform mat4 uMMatrix;\r \n#line 8 1 \n  \r \n#line 9 1 \n  // Incoming vertex attributes\r \n#line 10 1 \n  attribute vec4 uvLifeTimeFrameStart; // uv, lifeTime, frameStart\r \n#line 11 1 \n  attribute vec4 positionStartTime;    // position.xyz, startTime\r \n#line 12 1 \n  attribute vec4 velocityStartSize;    // velocity.xyz, startSize\r \n#line 13 1 \n  attribute vec4 accelerationEndSize;  // acceleration.xyz, endSize\r \n#line 14 1 \n  attribute vec4 spinStartSpinSpeed;   // spinStart.x, spinSpeed.y\r \n#line 15 1 \n  attribute vec4 orientation;          // orientation quaternion\r \n#line 16 1 \n  attribute vec4 colorMult;            // multiplies color and ramp textures\r \n#line 17 1 \n  \r \n#line 18 1 \n  // Outgoing variables to fragment shader\r \n#line 19 1 \n  varying vec2 outputTexcoord;\r \n#line 20 1 \n  varying float outputPercentLife;\r \n#line 21 1 \n  varying vec4 outputColorMult;\r \n#line 22 1 \n  \r \n#line 23 1 \n  void main(void) {\r \n#line 24 1 \n      vec2 uv = uvLifeTimeFrameStart.xy;\r \n#line 25 1 \n      float lifeTime = uvLifeTimeFrameStart.z;\r \n#line 26 1 \n      float frameStart = uvLifeTimeFrameStart.w;\r \n#line 27 1 \n      vec3 position = positionStartTime.xyz;\r \n#line 28 1 \n      float startTime = positionStartTime.w;\r \n#line 29 1 \n      vec3 velocity = velocityStartSize.xyz;\r \n#line 30 1 \n      float startSize = velocityStartSize.w;\r \n#line 31 1 \n      vec3 acceleration = accelerationEndSize.xyz;\r \n#line 32 1 \n      float endSize = accelerationEndSize.w;\r \n#line 33 1 \n      float spinStart = spinStartSpinSpeed.x;\r \n#line 34 1 \n      float spinSpeed = spinStartSpinSpeed.y;\r \n#line 35 1 \n      \r \n#line 36 1 \n      float localTime = mod((time - startTime), duration);\r \n#line 37 1 \n      float percentLife = localTime / lifeTime;\r \n#line 38 1 \n      float frame = mod(floor(localTime / frameDuration + frameStart),\r \n#line 39 1 \n                  numFrames);\r \n#line 40 1 \n      float uOffset = frame / numFrames;\r \n#line 41 1 \n      float u = uOffset + (uv.x + 0.5) * (1. / numFrames);\r \n#line 42 1 \n  \r \n#line 43 1 \n      outputTexcoord = vec2(u, uv.y + 0.5);\r \n#line 44 1 \n      outputColorMult = colorMult;\r \n#line 45 1 \n      \r \n#line 46 1 \n      float size = mix(startSize, endSize, percentLife);\r \n#line 47 1 \n      size = (percentLife < 0. || percentLife > 1.) ? 0. : size;\r \n#line 48 1 \n      float s = sin(spinStart + spinSpeed * localTime);\r \n#line 49 1 \n      float c = cos(spinStart + spinSpeed * localTime);\r \n#line 50 1 \n      vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, 0., \r \n#line 51 1 \n                               (uv.x * s - uv.y * c) * size, 1.);\r \n#line 52 1 \n      vec3 center = velocity * localTime +\r \n#line 53 1 \n                    acceleration * localTime * localTime + \r \n#line 54 1 \n                    position;\r \n#line 55 1 \n      vec4 q2 = orientation + orientation;\r \n#line 56 1 \n      vec4 qx = orientation.xxxw * q2.xyzx;\r \n#line 57 1 \n      vec4 qy = orientation.xyyw * q2.xyzy;\r \n#line 58 1 \n      vec4 qz = orientation.xxzw * q2.xxzz;\r \n#line 59 1 \n      mat4 localMatrix = mat4(\r \n#line 60 1 \n          (1.0 - qy.y) - qz.z, \r \n#line 61 1 \n          qx.y + qz.w, \r \n#line 62 1 \n          qx.z - qy.w,\r \n#line 63 1 \n          0,\r \n#line 64 1 \n          qx.y - qz.w, \r \n#line 65 1 \n          (1.0 - qx.x) - qz.z, \r \n#line 66 1 \n          qy.z + qx.w,\r \n#line 67 1 \n          0,\r \n#line 68 1 \n          qx.z + qy.w, \r \n#line 69 1 \n          qy.z - qx.w, \r \n#line 70 1 \n          (1.0 - qx.x) - qy.y,\r \n#line 71 1 \n          0,\r \n#line 72 1 \n          center.x, center.y, center.z, 1);\r \n#line 73 1 \n  \r \n#line 74 1 \n      rotatedPoint = localMatrix * rotatedPoint;\r \n#line 75 1 \n  \r \n#line 76 1 \n      outputPercentLife = percentLife;\r \n#line 77 1 \n  \r \n#line 78 1 \n      gl_Position = uPMatrix * uVMatrix * uMMatrix * rotatedPoint;\r \n#line 79 1 \n  } \n","extension":{},"attributes":{"uvLifeTimeFrameStart":{"type":"vec4","value":null},"positionStartTime":{"type":"vec4","value":null},"velocityStartSize":{"type":"vec4","value":null},"accelerationEndSize":{"type":"vec4","value":null},"spinStartSpinSpeed":{"type":"vec4","value":null},"orientation":{"type":"vec4","value":null},"colorMult":{"type":"vec4","value":null}},"uniforms":{"duration":{"type":"float","value":null},"time":{"type":"float","value":null},"frameDuration":{"type":"float","value":null},"numFrames":{"type":"float","value":null},"uPMatrix":{"type":"mat4","value":null},"uVMatrix":{"type":"mat4","value":null},"uMMatrix":{"type":"mat4","value":null}},"file":{"1":"./shaders/glsl/particle3d-vert.glsl","2":"./shaders/glsl/particle2d-vert.glsl"}};

var particle2dVert = {"code":"#line 1 1 \n  uniform vec4 _ANI_TEX_0;  // texWidth.x, texHeight.y, tileSize.z, numFrames.w\r \n#line 2 1 \n  uniform float _ANI_TEX_0_FPS;    // frameDuration = numFrames / _ANI_TEX_0_FPS;\r \n#line 3 1 \n  varying vec4 _ANI_TEX_UV; // ux.xy, numCols.z, numRows.w\r \n#line 4 1 \n  \r \n#line 5 1 \n  void _GEN_ANI_TEX_UV(float texWidth, float texHeight, float tileSize, float frame){\r \n#line 6 1 \n    float numCols = texWidth / tileSize;\r \n#line 7 1 \n    float numRows = texHeight / tileSize;\r \n#line 8 1 \n    float row = floor(frame / numCols);\r \n#line 9 1 \n    float col = mod(frame, numCols);\r \n#line 10 1 \n    float uOffset = col / numCols;\r \n#line 11 1 \n    float vOffset = row / numRows;\r \n#line 12 1 \n  \r \n#line 13 1 \n    _ANI_TEX_UV = vec4(\r \n#line 14 1 \n        uOffset, // + (uv.x + 0.5) / numCols\r \n#line 15 1 \n        1.0 - vOffset, //  - (uv.y + 0.5) / numRows  \r \n#line 16 1 \n        numCols, \r \n#line 17 1 \n        numRows\r \n#line 18 1 \n    );\r \n#line 19 1 \n  } \n\n#line 1 2 \n  \r \n#line 2 2 \n  \r \n#line 3 2 \n  //https://registry.khronos.org/OpenGL/extensions/OES/OES_texture_float.txt\r \n#line 4 2 \n  \r \n#line 5 2 \n  \r \n#line 6 2 \n  // uniform\r \n#line 7 2 \n  uniform mat4 uPMatrix;\r \n#line 8 2 \n  uniform mat4 uVMatrix;\r \n#line 9 2 \n  uniform mat4 uVInverseMatrix;\r \n#line 10 2 \n  uniform mat4 uMMatrix;\r \n#line 11 2 \n  uniform float duration;\r \n#line 12 2 \n  uniform float time;\r \n#line 13 2 \n  uniform float numParticle;\r \n#line 14 2 \n  uniform float numGen;\r \n#line 15 2 \n  uniform vec3 gravity;\r \n#line 16 2 \n  uniform float lifeTime;\r \n#line 17 2 \n  \r \n#line 18 2 \n  \r \n#line 19 2 \n  // PixelOne(pos.xyz, startSize.w) PixelTwo(linearVel.xyz, endSize.w)\r \n#line 20 2 \n  \r \n#line 21 2 \n  uniform sampler2D generatorSampler;\r \n#line 22 2 \n  \r \n#line 23 2 \n  \r \n#line 24 2 \n  #define ANI_TEX\r \n#line 25 2 \n  /* MACRO */\r \n#line 26 2 \n  #ifdef ANI_TEX\r \n#line 27 2 \n  #endif  /* MACRO ANI_TEX*/\r \n#line 28 2 \n  \r \n#line 29 2 \n  // attribute\r \n#line 30 2 \n  attribute float startTime;\r \n#line 31 2 \n  attribute float particleID;\r \n#line 32 2 \n  \r \n#line 33 2 \n  varying float outputPercentLife;\r \n#line 34 2 \n  \r \n#line 35 2 \n  const float NUM_COMPONENTS = 2.0;\r \n#line 36 2 \n  float pidPixels(float pid){\r \n#line 37 2 \n    return  pid*NUM_COMPONENTS;\r \n#line 38 2 \n  }\r \n#line 39 2 \n  float pidPixelsOffset(float pid, float offset){\r \n#line 40 2 \n    return  pid*NUM_COMPONENTS + offset + 0.5;\r \n#line 41 2 \n  }\r \n#line 42 2 \n  \r \n#line 43 2 \n  void main() {\r \n#line 44 2 \n    \r \n#line 45 2 \n    // aniTex\r \n#line 46 2 \n    float texWidth = _ANI_TEX_0.x;\r \n#line 47 2 \n    float texHeight = _ANI_TEX_0.y;\r \n#line 48 2 \n    float tileSize = _ANI_TEX_0.z;\r \n#line 49 2 \n    float numFrames = _ANI_TEX_0.w;\r \n#line 50 2 \n    float frameDuration = 1.0 / _ANI_TEX_0_FPS;\r \n#line 51 2 \n  \r \n#line 52 2 \n    float localTime = mod(time - startTime, duration) ;\r \n#line 53 2 \n    float percentLife = localTime / lifeTime;\r \n#line 54 2 \n    float frame = mod(floor(localTime / frameDuration),\r \n#line 55 2 \n                      numFrames);\r \n#line 56 2 \n    float generation = floor((time - startTime) / duration);\r \n#line 57 2 \n  \r \n#line 58 2 \n    float componentOffset = 0.0;\r \n#line 59 2 \n    float posTexCoordU = pidPixelsOffset(particleID, componentOffset) / pidPixels(numParticle);\r \n#line 60 2 \n    float posTexCoordV = 1.0 - (generation / numGen + 0.5 / numGen);  \r \n#line 61 2 \n    vec2 posTexCoord = vec2(posTexCoordU, posTexCoordV);\r \n#line 62 2 \n    vec3 position = texture2D(generatorSampler, posTexCoord).xyz;\r \n#line 63 2 \n    float startSize = texture2D(generatorSampler, posTexCoord).w;\r \n#line 64 2 \n  \r \n#line 65 2 \n    componentOffset = 1.0;\r \n#line 66 2 \n    float linearVelTexCoordU =  pidPixelsOffset(particleID, componentOffset) / pidPixels(numParticle);\r \n#line 67 2 \n    float linearVelTexCoordV = 1.0 - (generation / numGen + 0.5 / numGen);  \r \n#line 68 2 \n    vec2 linearVelTexCoord = vec2(linearVelTexCoordU, linearVelTexCoordV);\r \n#line 69 2 \n    vec3 linearVelocity = texture2D(generatorSampler, linearVelTexCoord).xyz;\r \n#line 70 2 \n    float endSize = texture2D(generatorSampler, linearVelTexCoord).w;\r \n#line 71 2 \n  \r \n#line 72 2 \n    _GEN_ANI_TEX_UV(texWidth, texHeight, tileSize, frame);\r \n#line 73 2 \n  \r \n#line 74 2 \n    float size = mix(startSize, endSize, percentLife);\r \n#line 75 2 \n    size = (percentLife < 0. || percentLife > 1.) ? 0. : size;\r \n#line 76 2 \n  \r \n#line 77 2 \n    vec3 velocity = linearVelocity;\r \n#line 78 2 \n    vec3 localPosition = velocity * localTime +\r \n#line 79 2 \n                         // acceleration * localTime * localTime + \r \n#line 80 2 \n                         position; \r \n#line 81 2 \n                         \r \n#line 82 2 \n    outputPercentLife = percentLife;\r \n#line 83 2 \n    gl_PointSize = size; \r \n#line 84 2 \n    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(localPosition, 1.);\r \n#line 85 2 \n  }\r \n#line 86 2 \n   \n","extension":{"GL_OES_texture_float":"enable","GL_OES_texture_float_linear":"enable"},"attributes":{"startTime":{"type":"float","value":null},"particleID":{"type":"float","value":null}},"uniforms":{"_ANI_TEX_0":{"type":"vec4","value":null},"_ANI_TEX_0_FPS":{"type":"float","value":null},"uPMatrix":{"type":"mat4","value":null},"uVMatrix":{"type":"mat4","value":null},"uVInverseMatrix":{"type":"mat4","value":null},"uMMatrix":{"type":"mat4","value":null},"duration":{"type":"float","value":null},"time":{"type":"float","value":null},"numParticle":{"type":"float","value":null},"numGen":{"type":"float","value":null},"gravity":{"type":"vec3","value":null},"lifeTime":{"type":"float","value":null},"generatorSampler":{"type":"sampler2D","value":"2"}},"file":{"1":"./shaders/glsl/testFolder/aniTex.glsl","2":"./shaders/glsl/particle2d-vert.glsl"}};

var particleFrag = {"code":"\n#line 1 1 \n  precision highp float;\r \n#line 2 1 \n  \r \n#line 3 1 \n  \r \n#line 4 1 \n  uniform sampler2D rampSampler;\r \n#line 5 1 \n  \r \n#line 6 1 \n  \r \n#line 7 1 \n  uniform sampler2D colorSampler;\r \n#line 8 1 \n  \r \n#line 9 1 \n  // Incoming variables from vertex shader\r \n#line 10 1 \n  varying float outputPercentLife;\r \n#line 11 1 \n  varying vec4 _ANI_TEX_UV;   // ux.xy, numCols.z, numRows.w\r \n#line 12 1 \n  \r \n#line 13 1 \n  void main(void) {\r \n#line 14 1 \n      vec2 pointUV = vec2(_ANI_TEX_UV.x, _ANI_TEX_UV.y);\r \n#line 15 1 \n      float numCols = _ANI_TEX_UV.z;\r \n#line 16 1 \n      float numRows = _ANI_TEX_UV.w;\r \n#line 17 1 \n      vec2 pointCoord = pointUV + vec2(gl_PointCoord.x / numCols, gl_PointCoord.y / numRows);\r \n#line 18 1 \n      vec4 colorMult = texture2D(rampSampler, vec2(outputPercentLife, 0.5));\r \n#line 19 1 \n      gl_FragColor = texture2D(colorSampler, pointCoord);    // * colorMult;\r \n#line 20 1 \n      // gl_FragColor = colorMult;\r \n#line 21 1 \n  } \n","extension":{},"attributes":{},"uniforms":{"rampSampler":{"type":"sampler2D","value":"0"},"colorSampler":{"type":"sampler2D","value":"1"}},"file":{"1":"./shaders/glsl/particle-frag.glsl","2":"./shaders/glsl/basic-vert.glsl"}};

var quadVert = {"code":"\n#line 1 1 \n  #ifdef GL_ES\r \n#line 2 1 \n  precision highp float;\r \n#line 3 1 \n  #endif\r \n#line 4 1 \n  \r \n#line 5 1 \n  attribute vec2 quad;\r \n#line 6 1 \n  varying vec2 vUV;\r \n#line 7 1 \n  \r \n#line 8 1 \n  void main() {\r \n#line 9 1 \n      vUV = (quad + 1.0) / 2.0;\r \n#line 10 1 \n      gl_Position = vec4(quad, 0.0, 1.0);\r \n#line 11 1 \n  }\r \n#line 12 1 \n   \n","extension":{},"attributes":{"quad":{"type":"vec2","value":null}},"uniforms":{},"file":{"1":"./shaders/glsl/quad-vert.glsl","2":"./shaders/glsl/basic-vert.glsl"}};

var solverFrag = {"code":"\n#line 1 1 \n  precision highp float;\r \n#line 2 1 \n  \r \n#line 3 1 \n  \r \n#line 4 1 \n  uniform sampler2D position;\r \n#line 5 1 \n  \r \n#line 6 1 \n  uniform sampler2D velociy;\r \n#line 7 1 \n  \r \n#line 8 1 \n  \r \n#line 9 1 \n  uniform float deltaTime;\r \n#line 10 1 \n  varying vec2 vUV;\r \n#line 11 1 \n  \r \n#line 12 1 \n  void main() {\r \n#line 13 1 \n  \r \n#line 14 1 \n      // vec4 psample = texture2D(position, vUV);\r \n#line 15 1 \n      // vec4 vsample = texture2D(velocity, vUV);\r \n#line 16 1 \n  \r \n#line 17 1 \n  \r \n#line 18 1 \n      //STEP one\r \n#line 19 1 \n      gl_FragData[0] = vec4(0.25,0,0,1);\r \n#line 20 1 \n      gl_FragData[1] = vec4(0,0.5,0,1);\r \n#line 21 1 \n      gl_FragData[2] = vec4(0,0,0.75,1);\r \n#line 22 1 \n      gl_FragData[3] = vec4(1.0,0,0,1);\r \n#line 23 1 \n  \r \n#line 24 1 \n  \r \n#line 25 1 \n  } \n","extension":{"GL_EXT_draw_buffers":"require"},"attributes":{},"uniforms":{"position":{"type":"sampler2D","value":"0"},"velociy":{"type":"sampler2D","value":"1"},"deltaTime":{"type":"float","value":"0.01666"}},"file":{"1":"./shaders/glsl/solver-frag.glsl","2":"./shaders/glsl/basic-vert.glsl"}};

export { basicFrag, basicVert, particle2dVert, particle3dVert, particleFrag, quadVert, solverFrag };
