#version 300 es
precision mediump float;
precision mediump int;

//#extension GL_OES_standard_derivatives : enable
//#extension GL_OES_texture_float : enable
////https://registry.khronos.org/OpenGL/extensions/OES/OES_texture_float.txt
//#extension GL_OES_texture_float_linear : enable


in vec2 vVertex;
in vec2 vUV;


#value uNumOfGrid:ivec2(128,128)
uniform ivec2 uNumOfGrid;

#value uSelCol:0
uniform sampler2D uSelCol;
#value uErrCol:1
uniform sampler2D uErrCol;
#value uHintCol:2
uniform sampler2D uHintCol;

#value switcher:[1,0]
uniform vec2 switcher;

#value uScale:4
uniform float uScale;

#value uTime:0.0
uniform float uTime; //ms

#value shinSpeed:4
uniform float shinSpeed;

#value uShineBrightness:0.6
uniform float uShineBrightness;



#value uShineOffset:0.8
uniform float uShineOffset;



#value ulineWidth:0.001
uniform float ulineWidth;

#value uGridBGCol:vec4(0.94, 0.96, 0.78, 1.0)
uniform vec4 uGridBGCol;
#value uGridLineCol:vec4(0.2,0.4,.9, 0.35)
uniform vec4 uGridLineCol;


#value uAlpha:0.4
uniform float uAlpha;


out vec4 fragColor;


// convert distance to alpha value (see https://www.shadertoy.com/view/ltBGzt)
float dtoa(float d)
{
    const float amount = 800.0;
    return clamp(1.0 / (clamp(d, 1.0/amount, 1.0)*amount), 0.,1.);
}


// distance to edge of grid line. real distance, and centered over its position.
float grid_d(vec2 uv, vec2 gridSize, float gridLineWidth)
{
    uv += gridLineWidth / 2.0;
    uv = mod(uv, gridSize);
    vec2 halfRemainingSpace = (gridSize - gridLineWidth) / 2.0;
    uv -= halfRemainingSpace + gridLineWidth;
    uv = abs(uv);
    uv = -(uv - halfRemainingSpace);
    return min(uv.x, uv.y);
}
bool checkInsideTriangle(vec2 uv, vec2 gridSize, float value){
    uv = mod(uv, gridSize);
    if(value == 2.0)//up
    return uv.y<-uv.x+gridSize.x;
    else if(value == 3.0)//right
    return uv.x>uv.y;
    else if(value == 4.0)//down
    return uv.y>-uv.x+gridSize.x;
    else if(value == 5.0)//left
    return uv.x<uv.y;

    return false;
}

//https://www.shadertoy.com/view/4tj3DG
void main() {
    //    float Size = 10.0;
    //    vec2 Pos = floor(vUV*vec2(200,200*uNumOfGrid[1]/uNumOfGrid[0]) / Size);
    //    float PatternMask = mod(Pos.x + mod(Pos.y, 2.0), 2.0);
    //    fragColor = PatternMask * vec4(1.0, 1.0, 1.0, 1.0);

    float uvScale = float(uNumOfGrid[1])/float(uNumOfGrid[0]);
    vec2 uv = vUV;
    uv.y *= uvScale;

    vec2 gridIndex = floor(vVertex);

    vec2 gridSize =  vec2(1.0/float(uNumOfGrid.x), uvScale/float(uNumOfGrid.y));
    vec4 selCol = texture(uSelCol, vUV),
    errCol =  texture(uErrCol, vUV),
    hintCol = texture(uHintCol, vUV);


    //ATTN: alpha value range from 1/10 of [1, 2,3,4,5]
    //tileBlockRule value
    if(hintCol.a == 0.1){
        hintCol = vec4(hintCol.rgb,hintCol.a*10.0);
    }else{
        if(checkInsideTriangle(uv,gridSize,hintCol.a*10.0))
        hintCol = vec4(hintCol.rgb,1);
        else
        hintCol = vec4(0);
    }




    //    vec4 mixCol = errCol + (1.0 - errCol.a)*hintCol;
    //
    //
    //    vec4 fillCol =  selCol + (1.0-selCol.a)*mixCol;




    vec4 fillCol =  selCol + (1.0-selCol.a)*hintCol;

    vec4 mixCol = errCol + (1.0 - errCol.a)*fillCol;

    float fillColMultiplier = uShineBrightness*(abs(sin(uTime*shinSpeed))) + uShineOffset;


    vec3 gridCol = vec3(mix(uGridBGCol.rgb, uGridBGCol.rgb*(1.0-mixCol.a) + mixCol.rgb*mixCol.a, fillColMultiplier));

    float lineWidth = ulineWidth / mix(float(uNumOfGrid.x),float(uNumOfGrid.y),0.5);
    float d = grid_d(uv,gridSize, 0.001);
    //    float alpha = mix( 0.2,uAlpha, hintCol.r);
    fragColor = vec4(mix(gridCol, uGridLineCol.rgb, uGridLineCol.a * dtoa(d)), uAlpha);




}
