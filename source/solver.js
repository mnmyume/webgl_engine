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
    framebuffer = null;
    constructor(params) {
        this.shader = params.shader || null;
        this.shape = params.shape || null;
        this.material = params.material || null;
    }
    initialize({gl}){

        this.ext = gl.getExtension("WEBGL_draw_buffers");
        $assert(this.ext);
        this.frontBuffer = [
            new FrameBuffer('fFrameBuff0'),
            new FrameBuffer('fFrameBuff1'),
            new FrameBuffer('fFrameBuff2'),
            new FrameBuffer('fFrameBuff3'),
        ];
        this.backBuffer = [
            new FrameBuffer('bFrameBuff0', {data:new Float32Array(testGenPos())}),
            new FrameBuffer('bFrameBuff1'),
            new FrameBuffer('bFrameBuff2'),
            new FrameBuffer('bFrameBuff3'),
        ];

        for(const frameBuff of [...this.frontBuffer,...this.backBuffer])
            frameBuff.initialize({gl});

        const fb = gl.createFramebuffer();
        this.framebuffer = fb;

        // this.attach(gl);
        // this.detach(gl);
    }

    attach(gl){
        const ext = this.ext;
        $assert(ext);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT0_WEBGL,
            gl.TEXTURE_2D,
            this.frontBuffer[0].texture,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT1_WEBGL,
            gl.TEXTURE_2D,
            this.frontBuffer[1].texture,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT2_WEBGL,
            gl.TEXTURE_2D,
            this.frontBuffer[2].texture,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT3_WEBGL,
            gl.TEXTURE_2D,
            this.frontBuffer[3].texture,
            0,
        );

        ext.drawBuffersWEBGL([
            ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
            ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
            ext.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
            ext.COLOR_ATTACHMENT3_WEBGL, // gl_FragData[3]
        ]);
    }

    detach(gl){

        const ext = this.ext;
        $assert(ext);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT0_WEBGL,
            gl.TEXTURE_2D,
            null,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT1_WEBGL,
            gl.TEXTURE_2D,
            null,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT2_WEBGL,
            gl.TEXTURE_2D,
            null,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT3_WEBGL,
            gl.TEXTURE_2D,
            null,
            0,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    update(gl){
        // gl.disable(gl.BLEND);
        this.attach(gl);


        this.material.setTexture('posSampler', this.backBuffer[0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.material.preDraw(gl);
        this.shape.draw(gl, this.material);
        this.material.postDraw(gl);

        this.swap();

        this.detach(gl);

        // gl.flush();
        
    }

    swap(){
        for(const i in this.frontBuffer)
            this.frontBuffer[i].swap(this.backBuffer[i]);
    }
}