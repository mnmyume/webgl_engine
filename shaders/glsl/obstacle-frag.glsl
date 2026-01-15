#version 300 es
precision highp float;
precision highp int;

#value uInitGridTexture:0
uniform sampler2D uInitGridTexture;

in vec2 vUV;

out vec4 fragColor;


void main()
{
    vec2 uv = vec2(vUV.x, 1.0-vUV.y);
    vec4 color;
    float obstacle = texture(uInitGridTexture, uv).g;
    if (obstacle > 0.5) {
        color = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        color = vec4(0);
    }

    fragColor = color;
}
