precision highp float;

#value texture:0
uniform sampler2D texture;

void main(void) {

    vec2 uv = gl_FragCoord.xy;  

    gl_FragColor = texture2D(texture, uv);
}
