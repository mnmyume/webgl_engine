let vertexShader = `
attribute vec2 a_position;
uniform vec4 u_translate;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0) + u_translate;
}
`

export default vertexShader