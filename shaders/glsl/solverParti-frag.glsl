precision mediump float;

#value colorSampler:1
uniform sampler2D colorSampler;

varying float outputSize;

varying float debug;

void main() {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);

    if(outputSize>1.0 && length(p) < 1.0) {
        gl_FragColor = vec4(1, 1, 1, 0.64);
//        if(debug ==15.0)
//            gl_FragColor = vec4(1.0);
//        else
//            gl_FragColor = vec4(1.0,0.0,0.0,1.0);

//        gl_FragColor = vec4(0.0,debug, 0.0, 1.0);

//        if(abs(debug - 0.75)<0.1)
//            gl_FragColor = vec4(1.0);
//        else
//            gl_FragColor = vec4(1.0,0.0,0.0,1.0);

//        gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    } else {
        discard;
    }
}
