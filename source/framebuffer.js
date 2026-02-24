import Texture2D from "./texture2d.js";
import {$assert} from "./common/commonHelper.js";

export default class Framebuffer {

    textures = [];
    constructor(name = 'frameBuffer', params) {
        this.name = name;
        this.params = params??{width:512,height:512};
        this.width = params.width??512;
        this.height = params.height??512;
    }

    initialize({ gl }) {
        this.framebuffer = gl.createFramebuffer();

        this.textures = [
            new Texture2D(`${this.name}-tex0`,this.params),
            new Texture2D(`${this.name}-tex1`,this.params),
            new Texture2D(`${this.name}-tex2`,this.params),
            new Texture2D(`${this.name}-tex3`,this.params)
        ];
        for(const tex of this.textures)
            tex.initialize({gl});

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.textures[0].texture,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT1,
            gl.TEXTURE_2D,
            this.textures[1].texture,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT2,
            gl.TEXTURE_2D,
            this.textures[2].texture,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT3,
            gl.TEXTURE_2D,
            this.textures[3].texture,
            0,
        );

        gl.drawBuffers([
            gl.COLOR_ATTACHMENT0, // gl_FragData[0]
            gl.COLOR_ATTACHMENT1, // gl_FragData[1]
            gl.COLOR_ATTACHMENT2, // gl_FragData[2]
            gl.COLOR_ATTACHMENT3, // gl_FragData[3]
        ]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }


    delete(gl){
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            null,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT1,
            gl.TEXTURE_2D,
            null,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT2,
            gl.TEXTURE_2D,
            null,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT3,
            gl.TEXTURE_2D,
            null,
            0,
        );
    }

}