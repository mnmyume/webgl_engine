const vertexShaderSource = `
    uniform float timeRange;
    uniform float time;
    uniform float frameDuration;
    uniform float numFrames;
    uniform mat4 uPMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uMMatrix;

    // Incoming vertex attributes
    attribute vec4 uvLifeTimeFrameStart; // uv, lifeTime, frameStart
    attribute vec4 positionStartTime;    // position.xyz, startTime
    attribute vec4 velocityStartSize;    // velocity.xyz, startSize
    attribute vec4 accelerationEndSize;  // acceleration.xyz, endSize
    attribute vec4 spinStartSpinSpeed;   // spinStart.x, spinSpeed.y
    attribute vec4 orientation;          // orientation quaternion
    attribute vec4 colorMult;            // multiplies color and ramp textures

    // Outgoing variables to fragment shader
    varying vec2 outputTexcoord;
    varying float outputPercentLife;
    varying vec4 outputColorMult;

    void main(void) {

        vec2 uv = uvLifeTimeFrameStart.xy;
        float lifeTime = uvLifeTimeFrameStart.z;
        float frameStart = uvLifeTimeFrameStart.w;
        vec3 position = positionStartTime.xyz;
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

        float size = mix(startSize, endSize, percentLife);
        size = (percentLife < 0. || percentLife > 1.) ? 0. : size;
        float s = sin(spinStart + spinSpeed * localTime);
        float c = cos(spinStart + spinSpeed * localTime);

        vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, 0., 
                                 (uv.x * s - uv.y * c) * size, 1.);
        vec3 center = velocity * localTime +
                      acceleration * localTime * localTime + 
                      position;

        vec4 q2 = orientation + orientation;
        vec4 qx = orientation.xxxw * q2.xyzx;
        vec4 qy = orientation.xyyw * q2.xyzy;
        vec4 qz = orientation.xxzw * q2.xxzz;

        mat4 localMatrix = mat4(
            (1.0 - qy.y) - qz.z, 
            qx.y + qz.w, 
            qx.z - qy.w,
            0,

            qx.y - qz.w, 
            (1.0 - qx.x) - qz.z, 
            qy.z + qx.w,
            0,

            qx.z + qy.w, 
            qy.z - qx.w, 
            (1.0 - qx.x) - qy.y,
            0,

            center.x, center.y, center.z, 1);
        rotatedPoint = localMatrix * rotatedPoint;
        outputPercentLife = percentLife;
        gl_Position = uPMatrix * uVMatrix * uMMatrix * rotatedPoint;
    }
`;

export default vertexShaderSource;