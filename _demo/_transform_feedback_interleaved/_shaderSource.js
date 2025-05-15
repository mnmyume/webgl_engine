export { vsTransformSource, fsTransformSource, vsFeedbackSource, fsFeedbackSource };


const vsTransformSource = `
#version 300 es
#define POSITION_LOCATION 0
        
precision highp float;
precision highp int;

uniform mat4 MVP;
layout(location = POSITION_LOCATION) in vec4 position;

out vec4 v_color;

void main()
{
    gl_Position = MVP * position;
    v_color = vec4(clamp(vec2(position), 0.0, 1.0), 0.0, 1.0);
}
`;

const fsTransformSource = `
#version 300 es
precision highp float;
precision highp int;

out vec4 color;

void main()
{
    color = vec4(1.0);
}
`;

const vsFeedbackSource = `
#version 300 es
#define POSITION_LOCATION 0
#define COLOR_POSITION 3
        
precision highp float;
precision highp int;

layout(location = POSITION_LOCATION) in vec4 position;
layout(location = COLOR_POSITION) in vec4 color;

out vec4 v_color;

void main()
{
    gl_Position = position;
    v_color = color;
}
`;

const fsFeedbackSource = `
#version 300 es
precision highp float;
precision highp int;

in vec4 v_color;

out vec4 color;

void main()
{
    color = v_color;
}
`;