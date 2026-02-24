import Shader from "./shader.js";
import Material from "./material.js";
import gridFrag from "../shaders/glsl/grid-frag.glsl";
import gridVert from "../shaders/glsl/grid-vert.glsl";
import Shape from "./shape.js";
import {quad, grid, readAttrSchema} from "./shapeHelper.js";
import Texture2D from "./texture2d.js";
import {SET_TEXCOL_BY_BOUNDARY} from "./generatorHelper.js";


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
    selGridCol = 'rgba(160,193,210,1.0)'

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
    }

    set SelBoundary(val){

        this.selData = new Float32Array(this.height*this.width*4);
        SET_TEXCOL_BY_BOUNDARY(this.selData, val, this.width, this.height, this.selGridCol);
        this.selTexture.setData(this.gl, this.selData)
    }

    constructor(name='__test',params={}){

    }

    //this.parent.glFrameWork
    initialize({gl, mode, gridUnitSize=1, col , row}){
        this.#timer = Date.now();
        this.gl = gl;

        const shader = new Shader('grid', {vertexSource:gridVert,fragmentSource:gridFrag});
        shader.initialize({gl});
        this.material = new Material("grid", {shader});
        this.material.initialize({gl});

        this.material.uniforms['uNumOfGrid'].value = [col,row];
        this.material.uniforms['uGridMode'].value = mode;
        this.material.uniforms['uUnitSize'].value = gridUnitSize;

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

        this.shape.initialize({gl});



        this.shape.update(gl,'gridBuffer', {material:this.material, data:data});

        this.selData = new Float32Array(col*row*4);
        this.selTexture = new Texture2D('selTexture', {width:col,height:row, data:this.selData});
        this.selTexture.initialize({gl});
        this.material.setTexture('uSelCol', this.selTexture);


        this.errData = new Float32Array(col*row*4);
        this.errTexture = new Texture2D('errTexture', {width:col,height:row, data:this.errData});
        this.errTexture.initialize({gl});
        this.material.setTexture('uErrCol', this.errTexture);


        this.hintData = new Float32Array(col*row*4);
        this.hintTexture = new Texture2D('hintTexture', {width:col,height:row, data:this.hintData});
        this.hintTexture.initialize({gl});
        this.material.setTexture('uHintCol', this.hintTexture);
    }

    mode = 0;//0:on  1:off   2:xRay
    set Mode(val){this.mode = val;}
    get Mode(){return this.mode;}

    preDraw(gl, camera){
        this.material.uniforms['uTime'].value = (Date.now() - this.#timer)/1000;
        this.material.setUniform('uGridBGCol', [0.94, 0.96, 0.78, 1.0]);
        this.material.setUniform('uGridLineCol', [0.2,0.4,.9, 0.35]);

        this.material.preDraw(gl, camera);
    }
    draw(gl, camera){


        if(this.Mode === 2){
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);

            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        if(this.Mode !== 1)
            this.shape.draw(gl, this.material);

        if(this.Mode === 2){
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.BLEND);
        }

    }

    postDraw(gl){
        this.material.postDraw(gl);

        // this.material.uniforms['switcher'].value = [0,1];
        // super.preDraw(graphic, camera);
        // this.draw(graphic, camera);
        // super.postDraw(graphic, camera);
        // this.material.uniforms['switcher'].value = [1,0];
    }


}
