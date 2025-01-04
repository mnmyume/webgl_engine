import Texture2D from "./texture2d.js";
import {$assert} from "./common.js";
import {FrameBuffer} from "./frameBuffer.js";
import {testGenPos} from "./generatorHelper.js";

export class Solver{


    frontBuffer = [];
    backBuffer = [];
    backBufferTextures = [];
    shader = null;
    material = null;
    ext = null;
    constructor(params) {
        this.width = params.width??512;
        this.height = params.height??512;
        this.shader = params.shader || null;
        this.shape = params.shape || null;
        this.material = params.material || null;
    }
    initialize({gl}){

        this.ext = gl.getExtension("WEBGL_draw_buffers");
        $assert(this.ext);
        this.frontBuffer = new FrameBuffer('fFrameBuff', {width:this.width,height:this.height});
        this.backBuffer = new FrameBuffer('bFrameBuff', {width:this.width,height:this.height});



        this.frontBuffer.initialize({gl});
        this.backBuffer.initialize({gl});


        this.backBuffer.textures[0].setData(gl, testGenPos());
        this.backBuffer.textures[1].setData(gl, testGenPos());

    }



    attach(gl){
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frontBuffer.framebuffer);
    }

    detach(gl){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    update(gl){
        // gl.disable(gl.BLEND);
        // this.attach(gl);

        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.ONE, gl.ZERO);  // so alpha output color draws correctly

        this.attach(gl);

        this.material.setTexture('posSampler', this.backBuffer.textures[0]);
        this.material.setTexture('velSampler', this.backBuffer.textures[1]);

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

        this.material.postDraw(gl);

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