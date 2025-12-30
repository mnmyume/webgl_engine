import Texture2D from "./texture2d.js";
import {$assert} from "./common.js";
import FrameBuffer from "./frameBuffer.js";

export default class FrameSolver{
    static MODE = {init:1, play:2}
    frontBuffer = [];
    backBuffer = [];
    backBufferTextures = [];
    shape = [];
    material = [];
    pixels = null;

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
        this.loop = params.loop || false;
    }
    initialize({gl}){

        this.backBuffer = new FrameBuffer('bFrameBuff', {width:this.width,height:this.height});
        this.frontBuffer = new FrameBuffer('fFrameBuff', {width:this.width,height:this.height});

        this.backBuffer.initialize({gl});
        this.frontBuffer.initialize({gl});

    }

    attach(gl){
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frontBuffer.framebuffer);
    }

    detach(gl){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    update(gl){

        if(!(this.mode & FrameSolver.MODE.play || this.mode & FrameSolver.MODE.init ))
            return;

        // gl.disable(gl.BLEND);
        // this.attach(gl);

        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.ONE, gl.ZERO);  // so alpha output color draws correctly

        this.attach(gl);

        this.material.setUniform('uState', this.mode);
        this.material.setUniform('uLoop', this.loop);
        this.material.setTexture('uDataSlot0', this.backBuffer.textures[0]);
        this.material.setTexture('uDataSlot1', this.backBuffer.textures[1]);
        this.material.setTexture('uDataSlot2', this.backBuffer.textures[2]);
        this.material.setTexture('uDataSlot3', this.backBuffer.textures[3]);

        this.material.preDraw(gl);
        this.shape.draw(gl, this.material);

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
        this.pixels = pixels;

        this.material.postDraw(gl);

        this.swap();

        this.detach(gl);

    }

    swap(){

        const tmp = this.frontBuffer;
        this.frontBuffer = this.backBuffer;
        this.backBuffer = tmp;
    }
}