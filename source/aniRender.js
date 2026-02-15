import Shader from "./shader.js";
import Material from "./material.js";
import charFrag from "../shaders/glsl/char2D-frag.glsl";
import charVert from "../shaders/glsl/char2D-frag.glsl";
import Shape from "./shape.js";
import {readAttrSchema} from "./shapeHelper.js";
import Texture2D from "./texture2d.js";
import {$getAttr} from "./headless.js";
import {$assert} from "./common.js";


export default class AniRender {

    static MODE = {stop:0, play:1, pause:2};
    material;
    shape;
    width;
    height;


    depth = -2;

    position = [0,0];//[0, 109];//[42,8];
    offset = [0,0,0];

    aniSequenceIndex = 0;


    image = null;
    texCellSize = null;

    mode = 0;
    pixelOffsetY = 0;
    startTime = null;
    pauseDuration = 0;
    set Mode(val){
        if(val=== AniRender.MODE.play && !this.mode){
            this.startTime = Date.now()/1000;
            this.pauseDuration = 0;
        }

        if(val === AniRender.MODE.pause && !this.mode){
            this.pauseDuration = Date.now()/1000 - this.startTime;
        }

        if(val=== AniRender.MODE.pause && this.mode=== AniRender.MODE.play){
            this.pauseDuration = Date.now()/1000 - this.startTime;
            this.startTime = null;
        }

        if(val=== AniRender.MODE.stop && this.mode=== AniRender.MODE.play){
            this.pauseDuration = Date.now()/1000 - this.startTime;
            this.startTime = null;
        }

        if(val=== AniRender.MODE.play && this.mode=== AniRender.MODE.pause){
            this.startTime =  Date.now()/1000 - this.pauseDuration;
            this.pauseDuration = 0;
        }
        if(val=== AniRender.MODE.stop && this.mode=== AniRender.MODE.pause){
            this.startTime =  null;
            this.pauseDuration = 0;
        }

        this.mode=val;
    }

    constructor(name='__test',params={}){
        this.image = params.image;
        this.texCellSize = params.texCellSize??48;
        this.texBoundarySize = params.texBoundarySize??[1,1];
        this.depth = params.depth??-2;
        this.scale = params.scale??1;
        this.pixelOffsetY = params.pixelOffsetY??0;
        this.canvasMode = params.canvasMode??1024; //platformer:1024
        this.mode = AniRender.MODE.stop;

        this.position = params.position??[0,0];
        this.offset = params.offset??[0,0,0];
    }


    //Override by 3D setting
    localBoundary = [0,0,0,0,0,0];
    get LocalBoundary(){return super.LocalBoundary;}
    set LocalBoundary(val){super.LocalBoundary = val;}


    createMat(gl, image = this.image){
        const shader = new Shader('char', {vertex:charVert,fragment:charFrag});
        shader.initialize({gl});
        const material = new Material("char", {shader});
        material.initialize({gl});
        material.setUniform('uTexCellSize', this.texCellSize);
        material.setUniform('uTexBoundarySize', this.texBoundarySize);

        const imageData = $getAttr(image);
        const tex = new Texture2D('test',{image:imageData});
        tex.initialize({gl});
        $assert(material);
        material.setTexture('uAniTex', tex);
        material.setUniform('uTexSize', [imageData.width,imageData.height]);
        return material;
    }

    initialize(gl, params={}){
        this.Mode = this.mode;
        let {material, shape} = params;
        super.initialize(graphic);

        this.transform.update();

        if(!material) {

            material = this.createMat(graphic);

        }

        this.material = material;


        if(!shape){
            shape = new Shape('char', {schema: readAttrSchema(charVert.input)});
            shape.initialize(graphic);
            this.updateBuffer(graphic,shape);
        }
        this.shape = shape;
    }

    //override fnc
    updateLocalBoundary(val){
        // debugger;

    }

    preDraw(gl, camera){
        super.preDraw(graphic,camera);
    }

    updateBuffer(gl, shape, uvSize = 1){

        const attrData = [];
        attrData.push( 0,uvSize);
        attrData.push( 0,0);
        attrData.push( uvSize,uvSize);

        attrData.push( 0,0);
        attrData.push( uvSize,0);
        attrData.push( uvSize,uvSize);
        shape.update(gl,'charBuffer', attrData);

    }

    draw(gl, camera){


        this.material.setUniform('uScale', this.scale);
        this.material.setUniform('uPixelOffsetY', this.pixelOffsetY);
        this.material.setUniform('uOffset', this.offset);
        this.material.setUniform('uDepth',this.depth);
        this.material.setUniform('uPosition', this.position);
        this.material.setUniform('uCanvasMode', this.canvasMode);

        this.material.setUniform('uAniSeq', this.aniSequenceIndex);

        if(this.mode === AniRender.MODE.play){
            $assert(this.startTime);
            this.material.setUniform('uTime', (Date.now()/1000-this.startTime));
        }
        if(this.mode === AniRender.MODE.stop || this.mode === AniRender.MODE.pause)
            this.material.setUniform('uTime', this.pauseDuration);

        // gl.enable(gl.BLEND);
        // gl.disable(gl.DEPTH_TEST);
        // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        super.draw(graphic);
        // gl.enable(gl.DEPTH_TEST);
        // gl.disable(gl.BLEND);
    }



}
