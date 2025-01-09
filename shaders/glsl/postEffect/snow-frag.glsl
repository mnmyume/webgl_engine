/////// I started playing around with some other things 
/////// and then I looked out the window and felt inspired :)
precision mediump float;
uniform vec2 iResolution;

void main(void)
{
    float snow = 0.0;

    int i=1, k=0;

    float numOfCells = 8.0;

    float ratio = iResolution.x/iResolution.y;
    vec2 uv = vec2(gl_FragCoord.x/iResolution.x-0.5,gl_FragCoord.y/iResolution.y-0.5);

    //uv.y /= ratio;

    mat2 isoMat = mat2(
    vec2(1.0,0.5),
    vec2(-1.0,0.5));



    vec2 cell = vec2(numOfCells,numOfCells);

    vec2 uvStep = floor(isoMat*(uv*cell))/2.0;



    gl_FragColor = vec4(uvStep,0.0,1.0);
}