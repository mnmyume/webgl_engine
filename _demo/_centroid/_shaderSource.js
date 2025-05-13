export { vsRenderSource, fsRenderSource,
         vsRenderCentroidSource, fsRenderCentroidSource,
         vsSplashSource, fsSplashSource };

const vsRenderSource = `
#version 300 es
#define POSITION_LOCATION 0
#define ATTRIBUTE_DATA_LOCATION 6
        
precision highp float;
precision highp int;

uniform mat4 MVP;

layout(location = POSITION_LOCATION) in vec2 position;
layout(location = ATTRIBUTE_DATA_LOCATION) in float data;
        
out float v_attribute;

void main()
{
    gl_Position = MVP * vec4(position, 0.0, 1.0);
    v_attribute = data;
}
`;

const fsRenderSource = `
#version 300 es
precision highp float;
precision highp int;

in float v_attribute;
out vec4 color;

void main()
{
    const vec4 blue   = vec4( 0.0, 0.0, 1.0, 1.0 );
    const vec4 yellow = vec4( 1.0, 1.0, 0.0, 1.0 );
    color = v_attribute >= 0.0 ? mix(blue, yellow, sqrt(v_attribute)) : yellow;
}
`;

const vsRenderCentroidSource = `
#version 300 es
#define POSITION_LOCATION 0
#define ATTRIBUTE_DATA_LOCATION 6
        
precision highp float;
precision highp int;

uniform mat4 MVP;

layout(location = POSITION_LOCATION) in vec2 position;
layout(location = ATTRIBUTE_DATA_LOCATION) in float data;
        
centroid out float v_attribute;

void main()
{
    gl_Position = MVP * vec4(position, 0.0, 1.0);
    v_attribute = data;
}
`;

const fsRenderCentroidSource = `
#version 300 es
precision highp float;
precision highp int;

centroid in float v_attribute;
out vec4 color;

void main()
{
    const vec4 blue   = vec4( 0.0, 0.0, 1.0, 1.0 );
    const vec4 yellow = vec4( 1.0, 1.0, 0.0, 1.0 );
    color = v_attribute >= 0.0 ? mix(blue, yellow, sqrt(v_attribute)) : yellow;
}
`;

const vsSplashSource = `
#version 300 es
precision highp float;
precision highp int;

uniform mat4 MVP;

layout(location = 0) in vec2 position;
layout(location = 1) in vec2 texcoord;

out vec2 v_st;

void main()
{
    v_st = texcoord;
    gl_Position = MVP * vec4(position, 0.0, 1.0);
}
`;

const fsSplashSource = `
#version 300 es
precision highp float;
precision highp int;

uniform sampler2D diffuse;

in vec2 v_st;

out vec4 color;

void main()
{
    color = texture(diffuse, v_st);
}
`;