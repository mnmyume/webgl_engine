import Shader from "../../../keanu3d-webgl/shader.js";
import Material from "../../../keanu3d-webgl/material.js";
import gridFrag from "../../../keanu3d-webgl/shaders/glsl/grid-frag.glsl";
import gridVert from "../../../keanu3d-webgl/shaders/glsl/grid-vert.glsl";
import Shape from "../../../keanu3d-webgl/shape.js";
import {quad, grid, readAttrSchema} from "../../../keanu3d-webgl/shapeHelper.js";
import Texture2D from "../../../keanu3d-webgl/texture2d.js";
import {SET_TEXCOL_BY_BLOCK_VAL, SET_TEXCOL_BY_BOUNDARY,SET_RANDOM_TEXCOL_BY_BOUNDARY, setting} from "../../editor/setting.js";


export default class Grid {

    #timer;
    material;
    shape;
    selection = null;
    selTexture = null;
    errTexture = null;
    hintTexture = null;
    width;
    height;
    selData = null;
    errData = null;
    hintData = null;

    delete(){
        this.material = null;
        this.shape = null;
        this.selection = null;
        this.selTexture = null;
        this.errTexture = null;
        this.hintTexture = null;
        this.width = null;
        this.height = null;
        this.selData = null;
        this.errData = null;
        this.hintData = null;
        super.delete();
    }

    set SelBoundary(val){

        this.selData = new Float32Array(this.height*this.width*4);
        SET_TEXCOL_BY_BOUNDARY(this.selData, val, this.width, this.height, setting.PALETTE.selGridCol);
        this.selTexture.setData(this.graphic, this.selData)

    }
    set ErrBoundary(val){


        this.errData = new Float32Array(this.height*this.width*4);
        SET_TEXCOL_BY_BOUNDARY(this.errData, val, this.width, this.height, setting.PALETTE.selErrCol);
        this.errTexture.setData(this.graphic, this.errData)

    }
    set ErrBoundaryGroup(val){


        this.errData = new Float32Array(this.height*this.width*4);
        SET_RANDOM_TEXCOL_BY_BOUNDARY(this.errData, val, this.width, this.height, setting.PALETTE.selErrCol);
        this.errTexture.setData(this.graphic, this.errData)

    }

    set HintBoundary(val){
        this.hintData = new Float32Array(this.height*this.width*4);
        SET_TEXCOL_BY_BOUNDARY(this.hintData, val, this.width, this.height,  setting.PALETTE.selHintCol,0.1);
        this.hintTexture.setData(this.graphic, this.hintData);
    }

    set CollisionHintBoundary(val){

        //ATTN: using uniform called 'uHintCol' in grid-frag.glsl
        //alpha value range from 1/10 of [1, 2,3,4,5]
        this.hintData = new Float32Array(this.height*this.width*4);
        SET_TEXCOL_BY_BLOCK_VAL(this.hintData, val, this.width, this.height,  setting.PALETTE.selCollisionCol);
        this.hintTexture.setData(this.graphic, this.hintData);
    }

    constructor(name='__test',params={}){
        super(name,params);
    }

    //this.parent.glFrameWork
    initialize({mode, gridUnitSize=1, col , row}){
        super.initialize();
        const graphic = this.graphic;
        this.#timer = Date.now();

        const shader = new Shader('grid', {vertex:gridVert,fragment:gridFrag});
        shader.initialize(graphic);
        this.material = new Material("grid", {shader});
        this.material.initialize(graphic);

        this.material.uniform['uNumOfGrid'].value = [col,row];
        this.material.uniform['uGridMode'].value = mode;
        this.material.uniform['uUnitSize'].value = gridUnitSize;

        this.width = col;
        this.height = row;



        //#define ISO_MAT(s) mat3(vec3(float(s)*0.5,-float(s)*0.25,0.0),vec3(-float(s)*0.5,-float(s)*0.25,0.0),vec3(0.0, 0.0, 1.0))
        //  1           -1
        // -0.5        -0.5
        const   leftBoundary = [-row, -0.5*row],
            bottomBoundary = [col-row, -0.5*col-0.5*row],
            rightBoundary = [col, -0.5*col];
        const  minX = -row,
            minY = -0.5*col-0.5*row, maxY = 0,
            maxX = col,
            minZ = 0,
            maxZ = 2;

        this.boundary = [minX, minY, minZ, maxX-minX, maxY-minY, maxZ - minZ];


        const data = grid([col, row], {mode:'quad'});
        this.shape = new Shape('grid', {
            schema:readAttrSchema(gridVert.input),
            state:Shape.RENDERSTATE.triangle});

        this.shape.initialize(graphic);



        this.shape.update(graphic,'gridBuffer', {material:this.material, data:data});

        this.selData = new Float32Array(col*row*4);
        this.selTexture = new Texture2D('selTexture', {width:col,height:row, data:this.selData});
        this.selTexture.initialize(graphic);
        this.material.setTexture('uSelCol', this.selTexture);


        this.errData = new Float32Array(col*row*4);
        this.errTexture = new Texture2D('errTexture', {width:col,height:row, data:this.errData});
        this.errTexture.initialize(graphic);
        this.material.setTexture('uErrCol', this.errTexture);


        this.hintData = new Float32Array(col*row*4);
        this.hintTexture = new Texture2D('hintTexture', {width:col,height:row, data:this.hintData});
        this.hintTexture.initialize(graphic);
        this.material.setTexture('uHintCol', this.hintTexture);
    }

    mode = 0;//0:on  1:off   2:xRay
    set Mode(val){this.mode = val;}
    get Mode(){return this.mode;}

    preDraw(graphic, camera){
        super.preDraw(graphic,camera);
    }
    draw(graphic = this.parent?.GLFrameWork?.Graphics,cam = this.parent?.camera){

        const gl = graphic.gl;

        this.material.uniform['uTime'].value = (Date.now() - this.#timer)/1000;
        if(this.Mode === 2){
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);

            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        if(this.Mode !== 1)
            super.draw(graphic);

        if(this.Mode === 2){
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.BLEND);
        }

    }

    postDraw(graphic, camera){
        const gl = graphic.gl;
        super.postDraw(graphic, camera);

        // this.material.uniform['switcher'].value = [0,1];
        // super.preDraw(graphic, camera);
        // this.draw(graphic, camera);
        // super.postDraw(graphic, camera);
        // this.material.uniform['switcher'].value = [1,0];
    }


}
