import Texture2D from "./texture2d.js";
import {$assert} from "./common.js";
import FrameBuffer from "./frameBuffer.js";
import {testGenPos, testGenVel} from "./generatorHelper.js";

export default class Solver{
    static MODE = {init:1, play:2}
    frontBuffer = [];
    backBuffer = [];
    backBufferTextures = [];
    obstacleBuffer = [];
    shape = [];
    material = [];
    ext = null;

    get Mode(){return this.mode}

    set Mode(value){
        this.mode = value;
    }

    constructor(params) {
        this.width = params.width??128;
        this.height = params.height??128;
        this.screenWidth = params.screenWidth??null;
        this.screenHeight = params.screenHeight??null;
        this.shape = params.shape || null;
        this.material = params.material || null;
        this.mode = params.mode || 0;
    }
    initialize({gl}){

        this.ext = gl.getExtension("WEBGL_draw_buffers");
        $assert(this.ext);
        this.backBuffer = new FrameBuffer('bFrameBuff', {width:this.width,height:this.height});
        this.frontBuffer = new FrameBuffer('fFrameBuff', {width:this.width,height:this.height});

        this.backBuffer.initialize({gl});
        this.frontBuffer.initialize({gl});

        this.obstacleBuffer = new FrameBuffer('oFrameBuff', {width:this.screenWidth,height:this.screenHeight});
        this.obstacleBuffer.initialize({gl});

    }

    attach(gl){
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frontBuffer.framebuffer);
    }

    detach(gl){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    addObstacles(gl){

        gl.viewport(0, 0, this.screenWidth, this.screenHeight);
        gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
        gl.blendFunc(gl.ONE, gl.ZERO);

        // attach
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.obstacleBuffer.framebuffer);

        this.material[1].preDraw(gl);
        this.shape[1].draw(gl, this.material[1]);
        this.material[1].postDraw(gl);

        // detach
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }


    update(gl){


        if(!(this.mode & Solver.MODE.play || this.mode & Solver.MODE.init ))
            return;

        // gl.disable(gl.BLEND);
        // this.attach(gl);

        // this.addObstacles(gl);

        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.ONE, gl.ZERO);  // so alpha output color draws correctly

        this.attach(gl);

        this.material[0].setUniform('state', this.mode);
        this.material[0].setTexture('posFB', this.backBuffer.textures[0]);
        this.material[0].setTexture('velFB', this.backBuffer.textures[1]);

        // this.material[0].setTexture('obsSampler', this.obstacleBuffer.textures[0]);

        this.material[0].preDraw(gl);
        this.shape[0].draw(gl, this.material[0]);

        const pixels = new Float32Array(
            this.width * this.height * 4,
        );
        gl.readPixels(
            0,
            0,
            this.width,
            this.height,
            gl.RGBA,
            gl.FLOAT,
            pixels,
        );

        this.material[0].postDraw(gl);

        this.swap();

        this.detach(gl);

        // gl.flush();
        
    }

    swap(){

        const tmp = this.frontBuffer;
        this.frontBuffer = this.backBuffer;
        this.backBuffer = tmp;
    }
}