import Texture2D from "./texture2d.js";
import {$assert} from "./common.js";

export class Solver{


    textures = [];
    shader = null;
    material = null;
    constructor(params) {
        this.shader = params.shader || null;
        this.material = params.material || null;
    }
    initialize(gl){

        this.textures = [
            new Texture2D('frameBuff0'),
            new Texture2D('frameBuff1'),
            new Texture2D('frameBuff2'),
            new Texture2D('frameBuff3'),
        ];
        const ext = gl.getExtension("WEBGL_draw_buffers");
        $assert(ext);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT0_WEBGL,
            gl.TEXTURE_2D,
            this.textures[0],
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT1_WEBGL,
            gl.TEXTURE_2D,
            this.textures[1],
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT2_WEBGL,
            gl.TEXTURE_2D,
            this.textures[2],
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            ext.COLOR_ATTACHMENT3_WEBGL,
            gl.TEXTURE_2D,
            this.textures[3],
            0,
        );
    }

    update(gl, textures){
        gl.disable(gl.BLEND);

    }
}