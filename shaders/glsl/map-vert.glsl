#version 300 es
precision highp float;
precision highp int;

#value uBoidsTexture:4
uniform sampler2D uBoidsTexture;
uniform int uEmitterTexSize;

out vec2 vPosition;
out vec2 vVelocity;

void main() {
    int id = gl_InstanceID;
    int width = uEmitterTexSize;
    int count = width*width;

    float u = (float(id % width) + 0.5) / float(width);
    float v = (float(id / width) + 0.5) / float(width);

    // 2. Fetch Particle Data
    vec4 data = texture(uBoidsTexture, vec2(u, v));
    vec2 pos = data.xy;
    vec2 vel = data.zw;

    // 3. Teleport to Grid Cell
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = 1.0;

    vPosition = pos;
    vVelocity = vel;
}