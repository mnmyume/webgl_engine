import Shader from "./shader.js";
import Material from "./material.js";
import charFrag from "../shaders/glsl/char2D-frag.glsl";
import charVert from "../shaders/glsl/char2D-vert.glsl";
import Shape from "./shape.js";
import {readAttrSchema} from "./shapeHelper.js";
import Texture2D from "./texture2d.js";
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
        this.canvasMode = params.canvasMode??2048; //platformer:1024
        this.mode = AniRender.MODE.stop;

        this.position = params.position??[0,0];
        this.offset = params.offset??[0,0,0];
    }

    //Override by 3D setting
    localBoundary = [0,0,0,0,0,0];
    get LocalBoundary(){return super.LocalBoundary;}
    set LocalBoundary(val){super.LocalBoundary = val;}


    initialize({gl}, params={}){
        this.Mode = this.mode;
        let {material, shape, aniTex} = params;
        this.material = material;
        this.shape = shape;

        this.material.initialize({gl});

        this.shape.initialize({gl});
        this.updateBuffer(gl, this.shape, this.material);

        this.material.setTexture('uAniTex', aniTex);
        this.material.setUniform('uTexCellSize', this.texCellSize);
        this.material.setUniform('uTexBoundarySize', this.texBoundarySize);
        this.material.setUniform('uTexSize', [aniTex.width, aniTex.height]);
    }

    //override fnc
    updateLocalBoundary(val){
        // debugger;

    }

    updateBuffer(gl, shape, material, uvSize = 1){

        const attrData = [];
        attrData.push( 0,uvSize);
        attrData.push( 0,0);
        attrData.push( uvSize,uvSize);

        attrData.push( 0,0);
        attrData.push( uvSize,0);
        attrData.push( uvSize,uvSize);
        shape.update(gl,'charBuffer', {material:material, data:attrData});

    }

    preDraw(gl, camera){
        this.material.setUniform('uScale', 10);
        // this.material.setUniform('uScale', this.scale);
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

        this.material.preDraw(gl, camera);
    }

    draw(gl, camera){
        this.shape.draw(gl, this.material)
        // gl.enable(gl.BLEND);
        // gl.disable(gl.DEPTH_TEST);
        // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // gl.enable(gl.DEPTH_TEST);
        // gl.disable(gl.BLEND);
    }

    postDraw(gl){
        this.material.postDraw(gl);
    }

}
