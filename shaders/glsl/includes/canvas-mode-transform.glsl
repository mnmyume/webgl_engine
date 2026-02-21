#define ISO_MAT(s) mat3(vec3(float(s)*0.5,-float(s)*0.25,0),vec3(-float(s)*0.5,-float(s)*0.25,0),vec3(0, 0, 1))

//topdown:512,
//platformer:1024,
//isometric:2048,

#define MODE_CHAR 256
#define MODE_TOPDOWN 512
#define MODE_PLATFORMER 1024
#define MODE_ISOMETRIC 2048


#define CHECK_MODE(mode, MODE) (((mode)&(MODE)) == MODE)
#define GET_CANVAS_MAT(mode, GRID_UNIT_SIZE)      ( CHECK_MODE(mode,MODE_ISOMETRIC)? ISO_MAT(GRID_UNIT_SIZE):mat3(vec3(GRID_UNIT_SIZE,0,0),vec3(0,-GRID_UNIT_SIZE,0),vec3(0,0,1)))




//mat3 isoMat = GET_CANVAS_MAT(uCanvasMode);
//vec3 origin = isoMat*vec3(gridIndex, -0.01); //ATTN origin is leftbottom corner
//
//vec2 quadPos = uv*GRID_UNIT_SIZE*texSize;
//
//vec2 alignPivot  = vec2(-0.5 * GRID_UNIT_SIZE*texSize.x, -(texSize.x/2.0) * GRID_UNIT_SIZE); //ATTN move sprite to match to grid Index
//vec2 vOffset = vec2(0,offsetV);
//vec3 position = origin + vec3( quadPos + alignPivot + vOffset, depth);//attribute float depth;

#define X_OFFSET_ISO_MULTIPLIER      -0.5 //1/2.0
#define X_OFFSET_GRID_CHAR_MULTIPLIER      -0.5 //1/2.0
#define Y_OFFSET_GRID_CHAR_MULTIPLIER      0.5 //1/2.0
#define X_OFFSET_GRID_MULTIPLIER  0.0
#define Y_OFFSET_GRID_MULTIPLIER  0.0


#define Y_OFFSET_MULTIPLIER  -0.5 //1/2.0
#define Y_OFFSET_ISO_CHAR_MULTIPLIER  -0.25     //1/4.0

vec3 CANVAS_TRANSFORM(int mode, float gridUnitSize, vec3 position, vec2 uv, vec2 texSize, vec2 offset){

    vec3 origin =  GET_CANVAS_MAT(mode, gridUnitSize)*position;
    texSize *= gridUnitSize;

    if(!CHECK_MODE(mode,MODE_ISOMETRIC)){
        uv = vec2(uv.x, uv.y-1.0);
    }
    vec2 quadPos =  uv*texSize;

    //    float mulX = CHECK_MODE(mode,MODE_ISOMETRIC)?
    //                    X_OFFSET_ISO_MULTIPLIER:
    //                        (CHECK_MODE(mode,MODE_CHAR)?X_OFFSET_GRID_CHAR_MULTIPLIER:X_OFFSET_GRID_MULTIPLIER);

    float mulX;
    if(CHECK_MODE(mode,MODE_ISOMETRIC))
    mulX = X_OFFSET_ISO_MULTIPLIER;
    else
    mulX = CHECK_MODE(mode,MODE_CHAR)? X_OFFSET_GRID_CHAR_MULTIPLIER:X_OFFSET_GRID_MULTIPLIER;



    //    float mulY =  CHECK_MODE(mode,MODE_ISOMETRIC)?
    //                        CHECK_MODE(mode,MODE_CHAR)?
    //                                Y_OFFSET_ISO_CHAR_MULTIPLIER:Y_OFFSET_MULTIPLIER:
    //                        Y_OFFSET_GRID_MULTIPLIER;

    float mulY;
    if(CHECK_MODE(mode,MODE_ISOMETRIC)){
        mulY = CHECK_MODE(mode,MODE_CHAR) ? Y_OFFSET_ISO_CHAR_MULTIPLIER:Y_OFFSET_MULTIPLIER;

    }else
    mulY = CHECK_MODE(mode,MODE_CHAR) ? Y_OFFSET_GRID_CHAR_MULTIPLIER:Y_OFFSET_GRID_MULTIPLIER;



    vec2 alignPivot =  vec2(mulX * texSize.x,
    mulY * texSize.x);
    return vec3(origin + vec3(quadPos + alignPivot + offset, 0));
}
