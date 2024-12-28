import Texture2D from "./texture2d.js";
import {$assert} from "./common.js";
import {FrameBuffer} from "./frameBuffer.js";

export class Solver{


    frontBuffer = [];
    backBuffer = [];
    backBufferTextures = [];
    shader = null;
    material = null;
    ext = null;
    constructor(params) {
        this.shader = params.shader || null;
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
            new FrameBuffer('bFrameBuff0'),
            new FrameBuffer('bFrameBuff1'),
            new FrameBuffer('bFrameBuff2'),
            new FrameBuffer('bFrameBuff3'),
        ];
        const ext = gl.getExtension("WEBGL_draw_buffers");
        $assert(ext);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
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
    }

    update(gl){
        // gl.disable(gl.BLEND);
        const ext = this.ext;

        this.material.draw(gl);

        ext.drawBuffersWEBGL([
            ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
            ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
            ext.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
            ext.COLOR_ATTACHMENT3_WEBGL, // gl_FragData[3]
        ]);

    }

    swap(){
        for(const i in this.frontBuffer)
            this.frontBuffer[i].swap(this.backBuffer[i]);
    }
}